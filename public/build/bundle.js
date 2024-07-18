
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
	'use strict';

	/** @returns {void} */
	function noop() {}

	/** @returns {void} */
	function add_location(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char }
		};
	}

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	/**
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function run_all(fns) {
		fns.forEach(run);
	}

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	/** @returns {boolean} */
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}

	let src_url_equal_anchor;

	/** @returns {boolean} */
	function src_url_equal(element_src, url) {
		if (!src_url_equal_anchor) {
			src_url_equal_anchor = document.createElement('a');
		}
		src_url_equal_anchor.href = url;
		return element_src === src_url_equal_anchor.href;
	}

	/** @returns {boolean} */
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append(target, node) {
		target.appendChild(node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * @template {keyof HTMLElementTagNameMap} K
	 * @param {K} name
	 * @returns {HTMLElementTagNameMap[K]}
	 */
	function element(name) {
		return document.createElement(name);
	}

	/**
	 * @template {keyof SVGElementTagNameMap} K
	 * @param {K} name
	 * @returns {SVGElement}
	 */
	function svg_element(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name);
	}

	/**
	 * @param {string} data
	 * @returns {Text}
	 */
	function text(data) {
		return document.createTextNode(data);
	}

	/**
	 * @returns {Text} */
	function space() {
		return text(' ');
	}

	/**
	 * @param {EventTarget} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @returns {() => void}
	 */
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}

	/**
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children(element) {
		return Array.from(element.childNodes);
	}

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @param {{ bubbles?: boolean, cancelable?: boolean }} [options]
	 * @returns {CustomEvent<T>}
	 */
	function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
		return new CustomEvent(type, { detail, bubbles, cancelable });
	}

	/**
	 * @typedef {Node & {
	 * 	claim_order?: number;
	 * 	hydrate_init?: true;
	 * 	actual_end_child?: NodeEx;
	 * 	childNodes: NodeListOf<NodeEx>;
	 * }} NodeEx
	 */

	/** @typedef {ChildNode & NodeEx} ChildNodeEx */

	/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

	/**
	 * @typedef {ChildNodeEx[] & {
	 * 	claim_info?: {
	 * 		last_index: number;
	 * 		total_claimed: number;
	 * 	};
	 * }} ChildNodeArray
	 */

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
	}

	const dirty_components = [];
	const binding_callbacks = [];

	let render_callbacks = [];

	const flush_callbacks = [];

	const resolved_promise = /* @__PURE__ */ Promise.resolve();

	let update_scheduled = false;

	/** @returns {void} */
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	/** @returns {void} */
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();

	let flushidx = 0; // Do *not* move this inside the flush() function

	/** @returns {void} */
	function flush() {
		// Do not reenter flush while dirty components are updated, as this can
		// result in an infinite loop. Instead, let the inner flush handle it.
		// Reentrancy is ok afterwards for bindings etc.
		if (flushidx !== 0) {
			return;
		}
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			try {
				while (flushidx < dirty_components.length) {
					const component = dirty_components[flushidx];
					flushidx++;
					set_current_component(component);
					update(component.$$);
				}
			} catch (e) {
				// reset dirty state to not end up in a deadlocked state and then rethrow
				dirty_components.length = 0;
				flushidx = 0;
				throw e;
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}

	/** @returns {void} */
	function update($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}

	/**
	 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function flush_render_callbacks(fns) {
		const filtered = [];
		const targets = [];
		render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
		targets.forEach((c) => c());
		render_callbacks = filtered;
	}

	const outroing = new Set();

	/**
	 * @type {Outro}
	 */
	let outros;

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} [local]
	 * @returns {void}
	 */
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} local
	 * @param {0 | 1} [detach]
	 * @param {() => void} [callback]
	 * @returns {void}
	 */
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					if (detach) block.d(1);
					callback();
				}
			});
			block.o(local);
		} else if (callback) {
			callback();
		}
	}

	/** @typedef {1} INTRO */
	/** @typedef {0} OUTRO */
	/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
	/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

	/**
	 * @typedef {Object} Outro
	 * @property {number} r
	 * @property {Function[]} c
	 * @property {Object} p
	 */

	/**
	 * @typedef {Object} PendingProgram
	 * @property {number} start
	 * @property {INTRO|OUTRO} b
	 * @property {Outro} [group]
	 */

	/**
	 * @typedef {Object} Program
	 * @property {number} a
	 * @property {INTRO|OUTRO} b
	 * @property {1|-1} d
	 * @property {number} duration
	 * @property {number} start
	 * @property {number} end
	 * @property {Outro} [group]
	 */

	/** @returns {void} */
	function create_component(block) {
		block && block.c();
	}

	/** @returns {void} */
	function mount_component(component, target, anchor) {
		const { fragment, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
			// if the component was destroyed immediately
			// it will update the `$$.on_destroy` reference to `null`.
			// the destructured on_destroy may still reference to the old array
			if (component.$$.on_destroy) {
				component.$$.on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}

	/** @returns {void} */
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			flush_render_callbacks($$.after_update);
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}

	/** @returns {void} */
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}

	/** @returns {void} */
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		/** @type {import('./private.js').T$$} */
		const $$ = (component.$$ = {
			fragment: null,
			ctx: [],
			// state
			props,
			update: noop,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				const nodes = children(options.target);
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}

	/**
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 */
	class SvelteComponent {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$ = undefined;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$set = undefined;

		/** @returns {void} */
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}

		/**
		 * @template {Extract<keyof Events, string>} K
		 * @param {K} type
		 * @param {((e: Events[K]) => void) | null | undefined} callback
		 * @returns {() => void}
		 */
		$on(type, callback) {
			if (!is_function(callback)) {
				return noop;
			}
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		/**
		 * @param {Partial<Props>} props
		 * @returns {void}
		 */
		$set(props) {
			if (this.$$set && !is_empty(props)) {
				this.$$.skip_bound = true;
				this.$$set(props);
				this.$$.skip_bound = false;
			}
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	// generated during release, do not modify

	/**
	 * The current version, as set in package.json.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-version
	 * @type {string}
	 */
	const VERSION = '4.0.0';
	const PUBLIC_VERSION = '4';

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @returns {void}
	 */
	function dispatch_dev(type, detail) {
		document.dispatchEvent(custom_event(type, { version: VERSION, ...detail }, { bubbles: true }));
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append_dev(target, node) {
		dispatch_dev('SvelteDOMInsert', { target, node });
		append(target, node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert_dev(target, node, anchor) {
		dispatch_dev('SvelteDOMInsert', { target, node, anchor });
		insert(target, node, anchor);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach_dev(node) {
		dispatch_dev('SvelteDOMRemove', { node });
		detach(node);
	}

	/**
	 * @param {Node} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @param {boolean} [has_prevent_default]
	 * @param {boolean} [has_stop_propagation]
	 * @param {boolean} [has_stop_immediate_propagation]
	 * @returns {() => void}
	 */
	function listen_dev(
		node,
		event,
		handler,
		options,
		has_prevent_default,
		has_stop_propagation,
		has_stop_immediate_propagation
	) {
		const modifiers =
			options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
		if (has_prevent_default) modifiers.push('preventDefault');
		if (has_stop_propagation) modifiers.push('stopPropagation');
		if (has_stop_immediate_propagation) modifiers.push('stopImmediatePropagation');
		dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
		const dispose = listen(node, event, handler, options);
		return () => {
			dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
			dispose();
		};
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr_dev(node, attribute, value) {
		attr(node, attribute, value);
		if (value == null) dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
		else dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
	}

	/**
	 * @param {Text} text
	 * @param {unknown} data
	 * @returns {void}
	 */
	function set_data_dev(text, data) {
		data = '' + data;
		if (text.data === data) return;
		dispatch_dev('SvelteDOMSetData', { node: text, data });
		text.data = /** @type {string} */ (data);
	}

	/**
	 * @returns {void} */
	function validate_slots(name, slot, keys) {
		for (const slot_key of Object.keys(slot)) {
			if (!~keys.indexOf(slot_key)) {
				console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
			}
		}
	}

	/**
	 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
	 *
	 * Can be used to create strongly typed Svelte components.
	 *
	 * #### Example:
	 *
	 * You have component library on npm called `component-library`, from which
	 * you export a component called `MyComponent`. For Svelte+TypeScript users,
	 * you want to provide typings. Therefore you create a `index.d.ts`:
	 * ```ts
	 * import { SvelteComponent } from "svelte";
	 * export class MyComponent extends SvelteComponent<{foo: string}> {}
	 * ```
	 * Typing this makes it possible for IDEs like VS Code with the Svelte extension
	 * to provide intellisense and to use the component like this in a Svelte file
	 * with TypeScript:
	 * ```svelte
	 * <script lang="ts">
	 * 	import { MyComponent } from "component-library";
	 * </script>
	 * <MyComponent foo={'bar'} />
	 * ```
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 * @template {Record<string, any>} [Slots=any]
	 * @extends {SvelteComponent<Props, Events>}
	 */
	class SvelteComponentDev extends SvelteComponent {
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Props}
		 */
		$$prop_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Events}
		 */
		$$events_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Slots}
		 */
		$$slot_def;

		/** @param {import('./public.js').ComponentConstructorOptions<Props>} options */
		constructor(options) {
			if (!options || (!options.target && !options.$$inline)) {
				throw new Error("'target' is a required option");
			}
			super();
		}

		/** @returns {void} */
		$destroy() {
			super.$destroy();
			this.$destroy = () => {
				console.warn('Component was already destroyed'); // eslint-disable-line no-console
			};
		}

		/** @returns {void} */
		$capture_state() {}

		/** @returns {void} */
		$inject_state() {}
	}

	if (typeof window !== 'undefined')
		// @ts-ignore
		(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

	/* src/components/Header.svelte generated by Svelte v4.0.0 */
	const file$9 = "src/components/Header.svelte";

	function create_fragment$9(ctx) {
		let div4;
		let div3;
		let div0;
		let img;
		let img_src_value;
		let t0;
		let div1;
		let nav;
		let ul;
		let li0;
		let a0;
		let t2;
		let li1;
		let a1;
		let t4;
		let li2;
		let a2;
		let t6;
		let div2;

		const block = {
			c: function create() {
				div4 = element("div");
				div3 = element("div");
				div0 = element("div");
				img = element("img");
				t0 = space();
				div1 = element("div");
				nav = element("nav");
				ul = element("ul");
				li0 = element("li");
				a0 = element("a");
				a0.textContent = "Conceptual Documentation";
				t2 = space();
				li1 = element("li");
				a1 = element("a");
				a1.textContent = "Ideas Blog";
				t4 = space();
				li2 = element("li");
				a2 = element("a");
				a2.textContent = "Contact";
				t6 = space();
				div2 = element("div");
				div2.innerHTML = ``;
				if (!src_url_equal(img.src, img_src_value = "/bible-logo.png")) attr_dev(img, "src", img_src_value);
				attr_dev(img, "class", "h-16 w-16");
				attr_dev(img, "alt", "Bible Logo");
				add_location(img, file$9, 7, 6, 250);
				attr_dev(div0, "class", "flex w-full flex-row justify-between md:w-1/4");
				add_location(div0, file$9, 6, 4, 184);
				attr_dev(a0, "class", "hover:text-gray-500");
				attr_dev(a0, "href", "https://project-accelerate.gitbook.io");
				attr_dev(a0, "target", "_blank");
				add_location(a0, file$9, 18, 12, 671);
				add_location(li0, file$9, 17, 10, 654);
				attr_dev(a1, "class", "hover:text-gray-500");
				attr_dev(a1, "href", "https://ryder.dev");
				add_location(a1, file$9, 25, 12, 890);
				add_location(li1, file$9, 24, 10, 873);
				attr_dev(a2, "class", "hover:text-gray-500");
				attr_dev(a2, "href", "mailto:ryderwishart@gmail.com");
				add_location(a2, file$9, 30, 12, 1032);
				add_location(li2, file$9, 29, 10, 1015);
				attr_dev(ul, "class", "flex flex-col space-y-1 text-base font-medium text-gray-900 md:flex-row md:space-x-8 md:space-y-0");
				add_location(ul, file$9, 14, 8, 514);
				attr_dev(nav, "id", "nav");
				attr_dev(nav, "class", "" + ((/*showNav*/ ctx[0] ? '' : 'hidden') + " w-full px-4 py-4 md:flex"));
				add_location(nav, file$9, 13, 6, 432);
				attr_dev(div1, "class", "mt-4 w-full rounded-t-md bg-white md:mt-0 md:w-auto md:bg-neutral-100");
				add_location(div1, file$9, 10, 4, 331);
				attr_dev(div2, "id", "buttons");
				attr_dev(div2, "class", "hidden w-full flex-col justify-end space-y-2 space-x-0 rounded-b-md bg-white px-3 pb-4 md:flex md:w-1/4 md:flex-row md:space-y-0 md:space-x-4 md:bg-neutral-100 md:px-0 md:pb-0");
				add_location(div2, file$9, 37, 4, 1198);
				attr_dev(div3, "class", "flex w-full flex-col items-center justify-between md:flex-row");
				add_location(div3, file$9, 5, 2, 104);
				attr_dev(div4, "class", "mx-auto w-full rounded-xl bg-neutral-100 p-6");
				add_location(div4, file$9, 4, 0, 43);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div4, anchor);
				append_dev(div4, div3);
				append_dev(div3, div0);
				append_dev(div0, img);
				append_dev(div3, t0);
				append_dev(div3, div1);
				append_dev(div1, nav);
				append_dev(nav, ul);
				append_dev(ul, li0);
				append_dev(li0, a0);
				append_dev(ul, t2);
				append_dev(ul, li1);
				append_dev(li1, a1);
				append_dev(ul, t4);
				append_dev(ul, li2);
				append_dev(li2, a2);
				append_dev(div3, t6);
				append_dev(div3, div2);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div4);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$9.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$9($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Header', slots, []);
		let showNav = false;
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ showNav });

		$$self.$inject_state = $$props => {
			if ('showNav' in $$props) $$invalidate(0, showNav = $$props.showNav);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [showNav];
	}

	class Header extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Header",
				options,
				id: create_fragment$9.name
			});
		}
	}

	/* src/components/Hero.svelte generated by Svelte v4.0.0 */
	const file$8 = "src/components/Hero.svelte";

	// (46:10) {#if showMacosDropdown}
	function create_if_block_2$1(ctx) {
		let div1;
		let div0;
		let a0;
		let t1;
		let a1;

		const block = {
			c: function create() {
				div1 = element("div");
				div0 = element("div");
				a0 = element("a");
				a0.textContent = "macOS (M1)";
				t1 = space();
				a1 = element("a");
				a1.textContent = "macOS (Intel)";
				attr_dev(a0, "href", "#");
				attr_dev(a0, "class", "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100");
				add_location(a0, file$8, 48, 16, 2022);
				attr_dev(a1, "href", "#");
				attr_dev(a1, "class", "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100");
				add_location(a1, file$8, 49, 16, 2129);
				attr_dev(div0, "class", "py-1");
				add_location(div0, file$8, 47, 14, 1987);
				attr_dev(div1, "class", "absolute mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5");
				add_location(div1, file$8, 46, 12, 1875);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);
				append_dev(div1, div0);
				append_dev(div0, a0);
				append_dev(div0, t1);
				append_dev(div0, a1);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div1);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_2$1.name,
			type: "if",
			source: "(46:10) {#if showMacosDropdown}",
			ctx
		});

		return block;
	}

	// (66:10) {#if showLinuxDropdown}
	function create_if_block_1$1(ctx) {
		let div1;
		let div0;
		let a0;
		let t1;
		let a1;
		let t3;
		let a2;

		const block = {
			c: function create() {
				div1 = element("div");
				div0 = element("div");
				a0 = element("a");
				a0.textContent = "Ubuntu";
				t1 = space();
				a1 = element("a");
				a1.textContent = "Fedora";
				t3 = space();
				a2 = element("a");
				a2.textContent = "Arch Linux";
				attr_dev(a0, "href", "#");
				attr_dev(a0, "class", "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100");
				add_location(a0, file$8, 68, 16, 3126);
				attr_dev(a1, "href", "#");
				attr_dev(a1, "class", "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100");
				add_location(a1, file$8, 69, 16, 3229);
				attr_dev(a2, "href", "#");
				attr_dev(a2, "class", "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100");
				add_location(a2, file$8, 70, 16, 3332);
				attr_dev(div0, "class", "py-1");
				add_location(div0, file$8, 67, 14, 3091);
				attr_dev(div1, "class", "absolute mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5");
				add_location(div1, file$8, 66, 12, 2979);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);
				append_dev(div1, div0);
				append_dev(div0, a0);
				append_dev(div0, t1);
				append_dev(div0, a1);
				append_dev(div0, t3);
				append_dev(div0, a2);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div1);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$1.name,
			type: "if",
			source: "(66:10) {#if showLinuxDropdown}",
			ctx
		});

		return block;
	}

	// (87:10) {#if showWindowsDropdown}
	function create_if_block$2(ctx) {
		let div1;
		let div0;
		let a0;
		let t1;
		let a1;

		const block = {
			c: function create() {
				div1 = element("div");
				div0 = element("div");
				a0 = element("a");
				a0.textContent = "Windows (x86)";
				t1 = space();
				a1 = element("a");
				a1.textContent = "Windows (ARM64)";
				attr_dev(a0, "href", "#");
				attr_dev(a0, "class", "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100");
				add_location(a0, file$8, 89, 16, 4344);
				attr_dev(a1, "href", "#");
				attr_dev(a1, "class", "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100");
				add_location(a1, file$8, 90, 16, 4454);
				attr_dev(div0, "class", "py-1");
				add_location(div0, file$8, 88, 14, 4309);
				attr_dev(div1, "class", "absolute mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5");
				add_location(div1, file$8, 87, 12, 4197);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);
				append_dev(div1, div0);
				append_dev(div0, a0);
				append_dev(div0, t1);
				append_dev(div0, a1);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div1);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$2.name,
			type: "if",
			source: "(87:10) {#if showWindowsDropdown}",
			ctx
		});

		return block;
	}

	function create_fragment$8(ctx) {
		let div12;
		let div0;
		let h1;
		let t1;
		let p;
		let t3;
		let div11;
		let div8;
		let div7;
		let div2;
		let button0;
		let div1;
		let i0;
		let t4;
		let span0;
		let t6;
		let t7;
		let div4;
		let button1;
		let div3;
		let i1;
		let t8;
		let span1;
		let t10;
		let t11;
		let div6;
		let button2;
		let div5;
		let i2;
		let t12;
		let span2;
		let t14;
		let t15;
		let img;
		let img_src_value;
		let t16;
		let div9;
		let svg0;
		let t17;
		let div10;
		let svg1;
		let mounted;
		let dispose;
		let if_block0 = /*showMacosDropdown*/ ctx[0] && create_if_block_2$1(ctx);
		let if_block1 = /*showLinuxDropdown*/ ctx[1] && create_if_block_1$1(ctx);
		let if_block2 = /*showWindowsDropdown*/ ctx[2] && create_if_block$2(ctx);

		const block = {
			c: function create() {
				div12 = element("div");
				div0 = element("div");
				h1 = element("h1");
				h1.textContent = "Codex Translation Editor";
				t1 = space();
				p = element("p");
				p.textContent = "Empowering Translators with Cutting-Edge AI";
				t3 = space();
				div11 = element("div");
				div8 = element("div");
				div7 = element("div");
				div2 = element("div");
				button0 = element("button");
				div1 = element("div");
				i0 = element("i");
				t4 = space();
				span0 = element("span");
				span0.textContent = "Download for macOS";
				t6 = space();
				if (if_block0) if_block0.c();
				t7 = space();
				div4 = element("div");
				button1 = element("button");
				div3 = element("div");
				i1 = element("i");
				t8 = space();
				span1 = element("span");
				span1.textContent = "Download for Linux";
				t10 = space();
				if (if_block1) if_block1.c();
				t11 = space();
				div6 = element("div");
				button2 = element("button");
				div5 = element("div");
				i2 = element("i");
				t12 = space();
				span2 = element("span");
				span2.textContent = "Download for Windows";
				t14 = space();
				if (if_block2) if_block2.c();
				t15 = space();
				img = element("img");
				t16 = space();
				div9 = element("div");
				svg0 = svg_element("svg");
				t17 = space();
				div10 = element("div");
				svg1 = svg_element("svg");
				attr_dev(h1, "class", "text-4xl font-semibold leading-snug tracking-tight md:text-5xl");
				add_location(h1, file$8, 24, 4, 790);
				attr_dev(p, "class", "text-gray-600");
				add_location(p, file$8, 27, 4, 911);
				attr_dev(div0, "class", "flex max-w-xl flex-col space-y-4");
				add_location(div0, file$8, 23, 2, 739);
				attr_dev(i0, "class", "fab fa-apple text-2xl");
				add_location(i0, file$8, 41, 14, 1688);
				attr_dev(span0, "class", "text-base");
				add_location(span0, file$8, 42, 14, 1740);
				attr_dev(div1, "class", "flex items-center justify-center space-x-2");
				add_location(div1, file$8, 40, 12, 1617);
				attr_dev(button0, "class", "block w-full rounded-md bg-gradient-to-br from-green-400 via-teal-500 to-blue-600 py-3 px-4 font-medium text-white hover:from-teal-600 hover:via-teal-500 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-teal-400 animate-gradient-x svelte-z8d8at");
				add_location(button0, file$8, 36, 10, 1269);
				attr_dev(div2, "class", "relative flex-1");
				add_location(div2, file$8, 35, 8, 1229);
				attr_dev(i1, "class", "fab fa-linux text-2xl");
				add_location(i1, file$8, 61, 14, 2792);
				attr_dev(span1, "class", "text-base");
				add_location(span1, file$8, 62, 14, 2844);
				attr_dev(div3, "class", "flex items-center justify-center space-x-2");
				add_location(div3, file$8, 60, 12, 2721);
				attr_dev(button1, "class", "block w-full rounded-md bg-gradient-to-br from-purple-500 via-pink-400 to-red-600 py-3 px-4 font-medium text-white hover:from-pink-600 hover:via-pink-500 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-pink-400 animate-gradient-x svelte-z8d8at");
				add_location(button1, file$8, 56, 10, 2374);
				attr_dev(div4, "class", "relative flex-1");
				add_location(div4, file$8, 55, 8, 2334);
				attr_dev(i2, "class", "fab fa-windows text-2xl");
				add_location(i2, file$8, 82, 14, 4004);
				attr_dev(span2, "class", "text-base");
				add_location(span2, file$8, 83, 14, 4058);
				attr_dev(div5, "class", "flex items-center justify-center space-x-2");
				add_location(div5, file$8, 81, 12, 3933);
				attr_dev(button2, "class", "block w-full rounded-md bg-gradient-to-br from-yellow-500 via-orange-400 to-red-600 py-3 px-4 font-medium text-white hover:from-orange-600 hover:via-orange-500 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-400 animate-gradient-x svelte-z8d8at");
				add_location(button2, file$8, 77, 10, 3576);
				attr_dev(div6, "class", "relative flex-1");
				add_location(div6, file$8, 76, 8, 3536);
				attr_dev(div7, "class", "flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4");
				add_location(div7, file$8, 33, 6, 1113);
				attr_dev(div8, "class", "mx-auto w-full rounded-xl bg-neutral-100 p-6 mt-8");
				add_location(div8, file$8, 32, 4, 1043);
				if (!src_url_equal(img.src, img_src_value = "/genesis-ui.jpg")) attr_dev(img, "src", img_src_value);
				attr_dev(img, "class", "relative z-50 rounded-xl md:w-auto");
				attr_dev(img, "alt", "Genesis UI");
				add_location(img, file$8, 98, 4, 4650);
				attr_dev(svg0, "width", "277");
				attr_dev(svg0, "height", "393");
				attr_dev(svg0, "viewBox", "0 0 277 393");
				attr_dev(svg0, "fill", "none");
				attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
				add_location(svg0, file$8, 101, 6, 4878);
				attr_dev(div9, "class", "absolute top-[30rem] left-1/2 -ml-[40rem] w-[163.125rem] max-w-none sm:-ml-[37.5rem]");
				add_location(div9, file$8, 100, 4, 4773);
				attr_dev(svg1, "width", "369");
				attr_dev(svg1, "height", "600");
				attr_dev(svg1, "viewBox", "0 0 369 600");
				attr_dev(svg1, "fill", "none");
				attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
				add_location(svg1, file$8, 106, 6, 5143);
				attr_dev(div10, "class", "absolute top-[18rem] left-1/2 z-0 -ml-[40rem] w-[163.125rem] max-w-none sm:ml-[17.5rem]");
				add_location(div10, file$8, 105, 4, 5035);
				attr_dev(div11, "class", "mx-auto max-w-4xl");
				add_location(div11, file$8, 31, 2, 1007);
				attr_dev(div12, "class", "relative flex w-full flex-col items-center space-y-12 overflow-hidden pt-12 text-center md:py-32");
				add_location(div12, file$8, 22, 0, 626);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div12, anchor);
				append_dev(div12, div0);
				append_dev(div0, h1);
				append_dev(div0, t1);
				append_dev(div0, p);
				append_dev(div12, t3);
				append_dev(div12, div11);
				append_dev(div11, div8);
				append_dev(div8, div7);
				append_dev(div7, div2);
				append_dev(div2, button0);
				append_dev(button0, div1);
				append_dev(div1, i0);
				append_dev(div1, t4);
				append_dev(div1, span0);
				append_dev(div2, t6);
				if (if_block0) if_block0.m(div2, null);
				append_dev(div7, t7);
				append_dev(div7, div4);
				append_dev(div4, button1);
				append_dev(button1, div3);
				append_dev(div3, i1);
				append_dev(div3, t8);
				append_dev(div3, span1);
				append_dev(div4, t10);
				if (if_block1) if_block1.m(div4, null);
				append_dev(div7, t11);
				append_dev(div7, div6);
				append_dev(div6, button2);
				append_dev(button2, div5);
				append_dev(div5, i2);
				append_dev(div5, t12);
				append_dev(div5, span2);
				append_dev(div6, t14);
				if (if_block2) if_block2.m(div6, null);
				append_dev(div11, t15);
				append_dev(div11, img);
				append_dev(div11, t16);
				append_dev(div11, div9);
				append_dev(div9, svg0);
				append_dev(div11, t17);
				append_dev(div11, div10);
				append_dev(div10, svg1);

				if (!mounted) {
					dispose = [
						listen_dev(button0, "click", /*click_handler*/ ctx[4], false, false, false, false),
						listen_dev(button1, "click", /*click_handler_1*/ ctx[5], false, false, false, false),
						listen_dev(button2, "click", /*click_handler_2*/ ctx[6], false, false, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (/*showMacosDropdown*/ ctx[0]) {
					if (if_block0) ; else {
						if_block0 = create_if_block_2$1(ctx);
						if_block0.c();
						if_block0.m(div2, null);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (/*showLinuxDropdown*/ ctx[1]) {
					if (if_block1) ; else {
						if_block1 = create_if_block_1$1(ctx);
						if_block1.c();
						if_block1.m(div4, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (/*showWindowsDropdown*/ ctx[2]) {
					if (if_block2) ; else {
						if_block2 = create_if_block$2(ctx);
						if_block2.c();
						if_block2.m(div6, null);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div12);
				}

				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$8.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$8($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Hero', slots, []);
		let showMacosDropdown = false;
		let showLinuxDropdown = false;
		let showWindowsDropdown = false;

		function toggleDropdown(dropdown) {
			if (dropdown === 'macos') {
				$$invalidate(0, showMacosDropdown = !showMacosDropdown);
				$$invalidate(1, showLinuxDropdown = false);
				$$invalidate(2, showWindowsDropdown = false);
			} else if (dropdown === 'linux') {
				$$invalidate(1, showLinuxDropdown = !showLinuxDropdown);
				$$invalidate(0, showMacosDropdown = false);
				$$invalidate(2, showWindowsDropdown = false);
			} else if (dropdown === 'windows') {
				$$invalidate(2, showWindowsDropdown = !showWindowsDropdown);
				$$invalidate(0, showMacosDropdown = false);
				$$invalidate(1, showLinuxDropdown = false);
			}
		}

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Hero> was created with unknown prop '${key}'`);
		});

		const click_handler = () => toggleDropdown('macos');
		const click_handler_1 = () => toggleDropdown('linux');
		const click_handler_2 = () => toggleDropdown('windows');

		$$self.$capture_state = () => ({
			showMacosDropdown,
			showLinuxDropdown,
			showWindowsDropdown,
			toggleDropdown
		});

		$$self.$inject_state = $$props => {
			if ('showMacosDropdown' in $$props) $$invalidate(0, showMacosDropdown = $$props.showMacosDropdown);
			if ('showLinuxDropdown' in $$props) $$invalidate(1, showLinuxDropdown = $$props.showLinuxDropdown);
			if ('showWindowsDropdown' in $$props) $$invalidate(2, showWindowsDropdown = $$props.showWindowsDropdown);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			showMacosDropdown,
			showLinuxDropdown,
			showWindowsDropdown,
			toggleDropdown,
			click_handler,
			click_handler_1,
			click_handler_2
		];
	}

	class Hero extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Hero",
				options,
				id: create_fragment$8.name
			});
		}
	}

	/* src/components/FeatureCard.svelte generated by Svelte v4.0.0 */
	const file$7 = "src/components/FeatureCard.svelte";

	// (19:34) 
	function create_if_block_5(ctx) {
		let path;

		const block = {
			c: function create() {
				path = svg_element("path");
				attr_dev(path, "d", "M21.3333 16C21.3333 13.0545 18.9455 10.6667 16 10.6667C13.0545 10.6667 10.6667 13.0545 10.6667 16C10.6667 18.9455 13.0545 21.3333 16 21.3333C18.9455 21.3333 21.3333 18.9455 21.3333 16ZM21.3333 16V18C21.3333 19.841 22.8257 21.3333 24.6667 21.3333C26.5076 21.3333 28 19.841 28 18V16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28M22 26.3923C20.1067 27.4854 18.0394 28.0039 15.9999 28.002");
				attr_dev(path, "stroke", "#A3A3A3");
				attr_dev(path, "stroke-width", "2");
				attr_dev(path, "stroke-linecap", "round");
				attr_dev(path, "stroke-linejoin", "round");
				add_location(path, file$7, 19, 6, 2165);
			},
			m: function mount(target, anchor) {
				insert_dev(target, path, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(path);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_5.name,
			type: "if",
			source: "(19:34) ",
			ctx
		});

		return block;
	}

	// (17:31) 
	function create_if_block_4(ctx) {
		let path;

		const block = {
			c: function create() {
				path = svg_element("path");
				attr_dev(path, "d", "M4 20.0001C4 22.9456 6.38781 25.3334 9.33333 25.3334H21.3333C25.0152 25.3334 28 22.3486 28 18.6667C28 14.9848 25.0152 12.0001 21.3333 12.0001C21.2889 12.0001 21.2445 12.0005 21.2002 12.0014C20.5831 8.95775 17.8924 6.66675 14.6667 6.66675C10.9848 6.66675 8 9.65152 8 13.3334C8 13.8359 8.05559 14.3253 8.16094 14.796C5.77942 15.3302 4 17.4573 4 20.0001Z");
				attr_dev(path, "stroke", "#A3A3A3");
				attr_dev(path, "stroke-width", "2");
				attr_dev(path, "stroke-linecap", "round");
				attr_dev(path, "stroke-linejoin", "round");
				add_location(path, file$7, 17, 6, 1679);
			},
			m: function mount(target, anchor) {
				insert_dev(target, path, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(path);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_4.name,
			type: "if",
			source: "(17:31) ",
			ctx
		});

		return block;
	}

	// (15:38) 
	function create_if_block_3(ctx) {
		let path;

		const block = {
			c: function create() {
				path = svg_element("path");
				attr_dev(path, "d", "M12 16L14.6667 18.6667L20 13.3333M28 16C28 22.6274 22.6274 28 16 28C9.37258 28 4 22.6274 4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16Z");
				attr_dev(path, "stroke", "#A3A3A3");
				attr_dev(path, "stroke-width", "2");
				attr_dev(path, "stroke-linecap", "round");
				attr_dev(path, "stroke-linejoin", "round");
				add_location(path, file$7, 15, 6, 1401);
			},
			m: function mount(target, anchor) {
				insert_dev(target, path, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(path);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_3.name,
			type: "if",
			source: "(15:38) ",
			ctx
		});

		return block;
	}

	// (13:34) 
	function create_if_block_2(ctx) {
		let path;

		const block = {
			c: function create() {
				path = svg_element("path");
				attr_dev(path, "d", "M21.3333 10.6666V21.3333M15.9999 14.6666V21.3333M10.6666 18.6666V21.3333M7.99992 26.6666H23.9999C25.4727 26.6666 26.6666 25.4727 26.6666 23.9999V7.99992C26.6666 6.52716 25.4727 5.33325 23.9999 5.33325H7.99992C6.52716 5.33325 5.33325 6.52716 5.33325 7.99992V23.9999C5.33325 25.4727 6.52716 26.6666 7.99992 26.6666Z");
				attr_dev(path, "stroke", "#A3A3A3");
				attr_dev(path, "stroke-width", "2");
				attr_dev(path, "stroke-linecap", "round");
				attr_dev(path, "stroke-linejoin", "round");
				add_location(path, file$7, 13, 6, 949);
			},
			m: function mount(target, anchor) {
				insert_dev(target, path, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(path);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_2.name,
			type: "if",
			source: "(13:34) ",
			ctx
		});

		return block;
	}

	// (11:30) 
	function create_if_block_1(ctx) {
		let path;

		const block = {
			c: function create() {
				path = svg_element("path");
				attr_dev(path, "d", "M9.33325 26.6666L14.6666 5.33325M17.3333 26.6666L22.6666 5.33325M7.99992 11.9999H26.6666M5.33325 19.9999H23.9999");
				attr_dev(path, "stroke", "#A3A3A3");
				attr_dev(path, "stroke-width", "2");
				attr_dev(path, "stroke-linecap", "round");
				attr_dev(path, "stroke-linejoin", "round");
				add_location(path, file$7, 11, 6, 702);
			},
			m: function mount(target, anchor) {
				insert_dev(target, path, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(path);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1.name,
			type: "if",
			source: "(11:30) ",
			ctx
		});

		return block;
	}

	// (9:4) {#if icon === 'message-circle'}
	function create_if_block$1(ctx) {
		let path;

		const block = {
			c: function create() {
				path = svg_element("path");
				attr_dev(path, "d", "M10.6667 15.9999H10.68M16 15.9999H16.0133M21.3333 15.9999H21.3467M28 15.9999C28 21.891 22.6274 26.6666 16 26.6666C13.9476 26.6666 12.0156 26.2086 10.3262 25.4013L4 26.6666L5.85999 21.7066C4.68209 20.0564 4 18.099 4 15.9999C4 10.1089 9.37258 5.33325 16 5.33325C22.6274 5.33325 28 10.1089 28 15.9999Z");
				attr_dev(path, "stroke", "#A3A3A3");
				attr_dev(path, "stroke-width", "2");
				attr_dev(path, "stroke-linecap", "round");
				attr_dev(path, "stroke-linejoin", "round");
				add_location(path, file$7, 9, 6, 273);
			},
			m: function mount(target, anchor) {
				insert_dev(target, path, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(path);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$1.name,
			type: "if",
			source: "(9:4) {#if icon === 'message-circle'}",
			ctx
		});

		return block;
	}

	function create_fragment$7(ctx) {
		let div1;
		let svg;
		let t0;
		let div0;
		let p0;
		let t1;
		let t2;
		let p1;
		let t3;

		function select_block_type(ctx, dirty) {
			if (/*icon*/ ctx[0] === 'message-circle') return create_if_block$1;
			if (/*icon*/ ctx[0] === 'hash') return create_if_block_1;
			if (/*icon*/ ctx[0] === 'wifi-off') return create_if_block_2;
			if (/*icon*/ ctx[0] === 'check-circle') return create_if_block_3;
			if (/*icon*/ ctx[0] === 'cloud') return create_if_block_4;
			if (/*icon*/ ctx[0] === 'settings') return create_if_block_5;
		}

		let current_block_type = select_block_type(ctx);
		let if_block = current_block_type && current_block_type(ctx);

		const block = {
			c: function create() {
				div1 = element("div");
				svg = svg_element("svg");
				if (if_block) if_block.c();
				t0 = space();
				div0 = element("div");
				p0 = element("p");
				t1 = text(/*title*/ ctx[1]);
				t2 = space();
				p1 = element("p");
				t3 = text(/*description*/ ctx[2]);
				attr_dev(svg, "width", "32");
				attr_dev(svg, "height", "32");
				attr_dev(svg, "viewBox", "0 0 32 32");
				attr_dev(svg, "fill", "none");
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				add_location(svg, file$7, 7, 2, 135);
				attr_dev(p0, "class", "font-medium");
				add_location(p0, file$7, 24, 4, 2724);
				attr_dev(p1, "class", "font-normal text-neutral-600");
				add_location(p1, file$7, 25, 4, 2763);
				attr_dev(div0, "class", "max-w-sm");
				add_location(div0, file$7, 23, 2, 2697);
				attr_dev(div1, "class", "flex flex-col space-y-2 text-left");
				add_location(div1, file$7, 6, 0, 85);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);
				append_dev(div1, svg);
				if (if_block) if_block.m(svg, null);
				append_dev(div1, t0);
				append_dev(div1, div0);
				append_dev(div0, p0);
				append_dev(p0, t1);
				append_dev(div0, t2);
				append_dev(div0, p1);
				append_dev(p1, t3);
			},
			p: function update(ctx, [dirty]) {
				if (current_block_type !== (current_block_type = select_block_type(ctx))) {
					if (if_block) if_block.d(1);
					if_block = current_block_type && current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(svg, null);
					}
				}

				if (dirty & /*title*/ 2) set_data_dev(t1, /*title*/ ctx[1]);
				if (dirty & /*description*/ 4) set_data_dev(t3, /*description*/ ctx[2]);
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div1);
				}

				if (if_block) {
					if_block.d();
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$7.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$7($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('FeatureCard', slots, []);
		let { icon } = $$props;
		let { title } = $$props;
		let { description } = $$props;

		$$self.$$.on_mount.push(function () {
			if (icon === undefined && !('icon' in $$props || $$self.$$.bound[$$self.$$.props['icon']])) {
				console.warn("<FeatureCard> was created without expected prop 'icon'");
			}

			if (title === undefined && !('title' in $$props || $$self.$$.bound[$$self.$$.props['title']])) {
				console.warn("<FeatureCard> was created without expected prop 'title'");
			}

			if (description === undefined && !('description' in $$props || $$self.$$.bound[$$self.$$.props['description']])) {
				console.warn("<FeatureCard> was created without expected prop 'description'");
			}
		});

		const writable_props = ['icon', 'title', 'description'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FeatureCard> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('icon' in $$props) $$invalidate(0, icon = $$props.icon);
			if ('title' in $$props) $$invalidate(1, title = $$props.title);
			if ('description' in $$props) $$invalidate(2, description = $$props.description);
		};

		$$self.$capture_state = () => ({ icon, title, description });

		$$self.$inject_state = $$props => {
			if ('icon' in $$props) $$invalidate(0, icon = $$props.icon);
			if ('title' in $$props) $$invalidate(1, title = $$props.title);
			if ('description' in $$props) $$invalidate(2, description = $$props.description);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [icon, title, description];
	}

	class FeatureCard extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$7, create_fragment$7, safe_not_equal, { icon: 0, title: 1, description: 2 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "FeatureCard",
				options,
				id: create_fragment$7.name
			});
		}

		get icon() {
			throw new Error("<FeatureCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set icon(value) {
			throw new Error("<FeatureCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get title() {
			throw new Error("<FeatureCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set title(value) {
			throw new Error("<FeatureCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get description() {
			throw new Error("<FeatureCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set description(value) {
			throw new Error("<FeatureCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/components/Features.svelte generated by Svelte v4.0.0 */
	const file$6 = "src/components/Features.svelte";

	function create_fragment$6(ctx) {
		let div7;
		let div6;
		let div0;
		let h1;
		let t1;
		let p;
		let t3;
		let div5;
		let div2;
		let div1;
		let featurecard0;
		let t4;
		let featurecard1;
		let t5;
		let featurecard2;
		let t6;
		let div4;
		let div3;
		let featurecard3;
		let t7;
		let featurecard4;
		let t8;
		let featurecard5;
		let current;

		featurecard0 = new FeatureCard({
				props: {
					icon: "message-circle",
					title: "Translator's Copilot",
					description: "Your AI ally, offering contextual suggestions and seamless chat interfaces for unparalleled assistance."
				},
				$$inline: true
			});

		featurecard1 = new FeatureCard({
				props: {
					icon: "hash",
					title: "Multimodal Inputs & Outputs",
					description: "Embracing a spectrum of audio and visual resources to enrich the translation experience."
				},
				$$inline: true
			});

		featurecard2 = new FeatureCard({
				props: {
					icon: "wifi-off",
					title: "Offline Accessibility",
					description: "Tools that are there when you need them, anywhere, anytime."
				},
				$$inline: true
			});

		featurecard3 = new FeatureCard({
				props: {
					icon: "check-circle",
					title: "Localization",
					description: "Catering to the top-ten strategic languages, embracing global translation needs."
				},
				$$inline: true
			});

		featurecard4 = new FeatureCard({
				props: {
					icon: "cloud",
					title: "Unopinionated Tools",
					description: "Flexibly adapting to your unique translation style and project requirements."
				},
				$$inline: true
			});

		featurecard5 = new FeatureCard({
				props: {
					icon: "settings",
					title: "Codex App: A robust translation editor",
					description: "A robust translation editor that is simple and intuitive at first glance, but powerful and customizable when you need it."
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				div7 = element("div");
				div6 = element("div");
				div0 = element("div");
				h1 = element("h1");
				h1.textContent = "Codex App & Translator's Copilot";
				t1 = space();
				p = element("p");
				p.textContent = "Inspired by VS Code, reimagined for translation excellence.";
				t3 = space();
				div5 = element("div");
				div2 = element("div");
				div1 = element("div");
				create_component(featurecard0.$$.fragment);
				t4 = space();
				create_component(featurecard1.$$.fragment);
				t5 = space();
				create_component(featurecard2.$$.fragment);
				t6 = space();
				div4 = element("div");
				div3 = element("div");
				create_component(featurecard3.$$.fragment);
				t7 = space();
				create_component(featurecard4.$$.fragment);
				t8 = space();
				create_component(featurecard5.$$.fragment);
				attr_dev(h1, "class", "text-3xl font-semibold leading-snug text-neutral-900 md:text-4xl");
				add_location(h1, file$6, 3, 6, 218);
				attr_dev(p, "class", "text-neutral-600");
				add_location(p, file$6, 6, 6, 355);
				attr_dev(div0, "class", "flex max-w-xl flex-col space-y-2");
				add_location(div0, file$6, 2, 4, 165);
				attr_dev(div1, "class", "flex w-full flex-col justify-between space-y-6 md:flex-row md:space-y-0 md:space-x-12");
				add_location(div1, file$6, 12, 8, 573);
				attr_dev(div2, "class", "flex max-w-6xl");
				add_location(div2, file$6, 11, 6, 536);
				attr_dev(div3, "class", "flex w-full flex-col justify-between space-y-6 md:flex-row md:space-y-0 md:space-x-12");
				add_location(div3, file$6, 31, 8, 1400);
				attr_dev(div4, "class", "flex max-w-6xl");
				add_location(div4, file$6, 30, 6, 1363);
				attr_dev(div5, "class", "flex flex-col space-y-8 md:space-y-20");
				add_location(div5, file$6, 10, 4, 478);
				attr_dev(div6, "class", "flex w-full flex-col items-center space-y-12 py-12 text-center md:space-y-20 md:py-32");
				add_location(div6, file$6, 1, 2, 61);
				attr_dev(div7, "class", "mx-auto w-full rounded-xl bg-neutral-100 p-6");
				add_location(div7, file$6, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div7, anchor);
				append_dev(div7, div6);
				append_dev(div6, div0);
				append_dev(div0, h1);
				append_dev(div0, t1);
				append_dev(div0, p);
				append_dev(div6, t3);
				append_dev(div6, div5);
				append_dev(div5, div2);
				append_dev(div2, div1);
				mount_component(featurecard0, div1, null);
				append_dev(div1, t4);
				mount_component(featurecard1, div1, null);
				append_dev(div1, t5);
				mount_component(featurecard2, div1, null);
				append_dev(div5, t6);
				append_dev(div5, div4);
				append_dev(div4, div3);
				mount_component(featurecard3, div3, null);
				append_dev(div3, t7);
				mount_component(featurecard4, div3, null);
				append_dev(div3, t8);
				mount_component(featurecard5, div3, null);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(featurecard0.$$.fragment, local);
				transition_in(featurecard1.$$.fragment, local);
				transition_in(featurecard2.$$.fragment, local);
				transition_in(featurecard3.$$.fragment, local);
				transition_in(featurecard4.$$.fragment, local);
				transition_in(featurecard5.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(featurecard0.$$.fragment, local);
				transition_out(featurecard1.$$.fragment, local);
				transition_out(featurecard2.$$.fragment, local);
				transition_out(featurecard3.$$.fragment, local);
				transition_out(featurecard4.$$.fragment, local);
				transition_out(featurecard5.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div7);
				}

				destroy_component(featurecard0);
				destroy_component(featurecard1);
				destroy_component(featurecard2);
				destroy_component(featurecard3);
				destroy_component(featurecard4);
				destroy_component(featurecard5);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$6.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$6($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Features', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Features> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ FeatureCard });
		return [];
	}

	class Features extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Features",
				options,
				id: create_fragment$6.name
			});
		}
	}

	/* src/components/TranslationTools.svelte generated by Svelte v4.0.0 */
	const file$5 = "src/components/TranslationTools.svelte";

	function create_fragment$5(ctx) {
		let div15;
		let div14;
		let div0;
		let h1;
		let t1;
		let p0;
		let t2;
		let div13;
		let div7;
		let div3;
		let div2;
		let div1;
		let h30;
		let t4;
		let p1;
		let t6;
		let div6;
		let div5;
		let div4;
		let h31;
		let t8;
		let p2;
		let t10;
		let img;
		let img_src_value;
		let t11;
		let div12;
		let div11;
		let div10;
		let div9;
		let div8;
		let h32;
		let t13;
		let p3;

		const block = {
			c: function create() {
				div15 = element("div");
				div14 = element("div");
				div0 = element("div");
				h1 = element("h1");
				h1.textContent = "Translation tools that simplify your work";
				t1 = space();
				p0 = element("p");
				t2 = space();
				div13 = element("div");
				div7 = element("div");
				div3 = element("div");
				div2 = element("div");
				div1 = element("div");
				h30 = element("h3");
				h30.textContent = "Advanced Translation Assistance";
				t4 = space();
				p1 = element("p");
				p1.textContent = "Get suggestions, corrections, and more in a simple text editor.";
				t6 = space();
				div6 = element("div");
				div5 = element("div");
				div4 = element("div");
				h31 = element("h3");
				h31.textContent = "Conversational insights";
				t8 = space();
				p2 = element("p");
				p2.textContent = "Learning about the source texts is like talking to an expert.";
				t10 = space();
				img = element("img");
				t11 = space();
				div12 = element("div");
				div11 = element("div");
				div10 = element("div");
				div9 = element("div");
				div8 = element("div");
				h32 = element("h3");
				h32.textContent = "Orchestrated AI automations (Coming soon!)";
				t13 = space();
				p3 = element("p");
				p3.textContent = "Let AI tools automate the repetitive tasks you already do so you can focus on the work that matters.";
				attr_dev(h1, "class", "text-3xl font-semibold leading-snug text-white md:text-4xl");
				add_location(h1, file$5, 3, 6, 209);
				attr_dev(p0, "class", "text-neutral-400");
				add_location(p0, file$5, 6, 6, 349);
				attr_dev(div0, "class", "flex flex-col space-y-2");
				add_location(div0, file$5, 2, 4, 165);
				attr_dev(h30, "class", "text-xl font-medium text-white");
				add_location(h30, file$5, 13, 14, 740);
				attr_dev(p1, "class", "text-neutral-300");
				add_location(p1, file$5, 16, 14, 866);
				attr_dev(div1, "class", "flex flex-col space-y-1");
				add_location(div1, file$5, 12, 12, 688);
				attr_dev(div2, "class", "relative flex w-full flex-col overflow-hidden px-10 py-9 text-left");
				add_location(div2, file$5, 11, 10, 595);
				attr_dev(div3, "class", "flex w-full overflow-clip rounded-xl bg-neutral-700 text-white");
				add_location(div3, file$5, 10, 8, 508);
				attr_dev(h31, "class", "text-xl font-medium text-white");
				add_location(h31, file$5, 25, 14, 1308);
				attr_dev(p2, "class", "text-neutral-300");
				add_location(p2, file$5, 28, 14, 1426);
				attr_dev(div4, "class", "flex flex-col space-y-1");
				add_location(div4, file$5, 24, 12, 1256);
				attr_dev(img, "class", "7xl:mt-16 md:mt-18 absolute mt-28 -ml-8 w-full min-w-[700px]");
				if (!src_url_equal(img.src, img_src_value = "/chat.png")) attr_dev(img, "src", img_src_value);
				attr_dev(img, "alt", "Chat interface");
				add_location(img, file$5, 32, 12, 1583);
				attr_dev(div5, "class", "relative flex h-[300px] w-full flex-col overflow-hidden px-10 py-9 text-left md:h-[408px]");
				add_location(div5, file$5, 23, 10, 1140);
				attr_dev(div6, "class", "flex w-full overflow-clip rounded-xl bg-neutral-700 text-white");
				add_location(div6, file$5, 22, 8, 1053);
				attr_dev(div7, "class", "w-full max-w-6xl justify-between space-y-12");
				add_location(div7, file$5, 9, 6, 442);
				attr_dev(h32, "class", "text-xl font-medium text-white");
				add_location(h32, file$5, 41, 16, 2129);
				attr_dev(p3, "class", "text-neutral-300");
				add_location(p3, file$5, 44, 16, 2272);
				attr_dev(div8, "class", "flex flex-col space-y-1");
				add_location(div8, file$5, 40, 14, 2075);
				attr_dev(div9, "class", "relative flex w-full flex-col overflow-hidden px-10 py-9 text-left");
				add_location(div9, file$5, 39, 12, 1980);
				attr_dev(div10, "class", "flex w-full overflow-clip rounded-xl bg-neutral-700 text-white");
				add_location(div10, file$5, 38, 10, 1891);
				attr_dev(div11, "class", "flex flex-col space-y-12 lg:flex-row lg:space-y-0 lg:space-x-12");
				add_location(div11, file$5, 37, 8, 1803);
				attr_dev(div12, "class", "w-full max-w-6xl justify-between");
				add_location(div12, file$5, 36, 6, 1748);
				attr_dev(div13, "class", "flex flex-col space-y-12");
				add_location(div13, file$5, 8, 4, 397);
				attr_dev(div14, "class", "flex w-full flex-col items-center space-y-12 py-12 text-center md:space-y-24 md:py-32");
				add_location(div14, file$5, 1, 2, 61);
				attr_dev(div15, "class", "mx-auto w-full rounded-xl bg-neutral-800 p-6");
				add_location(div15, file$5, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div15, anchor);
				append_dev(div15, div14);
				append_dev(div14, div0);
				append_dev(div0, h1);
				append_dev(div0, t1);
				append_dev(div0, p0);
				append_dev(div14, t2);
				append_dev(div14, div13);
				append_dev(div13, div7);
				append_dev(div7, div3);
				append_dev(div3, div2);
				append_dev(div2, div1);
				append_dev(div1, h30);
				append_dev(div1, t4);
				append_dev(div1, p1);
				append_dev(div7, t6);
				append_dev(div7, div6);
				append_dev(div6, div5);
				append_dev(div5, div4);
				append_dev(div4, h31);
				append_dev(div4, t8);
				append_dev(div4, p2);
				append_dev(div5, t10);
				append_dev(div5, img);
				append_dev(div13, t11);
				append_dev(div13, div12);
				append_dev(div12, div11);
				append_dev(div11, div10);
				append_dev(div10, div9);
				append_dev(div9, div8);
				append_dev(div8, h32);
				append_dev(div8, t13);
				append_dev(div8, p3);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div15);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$5.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$5($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('TranslationTools', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TranslationTools> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class TranslationTools extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "TranslationTools",
				options,
				id: create_fragment$5.name
			});
		}
	}

	/* src/components/PartnerLogo.svelte generated by Svelte v4.0.0 */
	const file$4 = "src/components/PartnerLogo.svelte";

	// (13:4) {:else}
	function create_else_block(ctx) {
		let img;
		let img_src_value;

		const block = {
			c: function create() {
				img = element("img");
				if (!src_url_equal(img.src, img_src_value = /*src*/ ctx[0])) attr_dev(img, "src", img_src_value);
				attr_dev(img, "class", "h-9 rounded-full");
				attr_dev(img, "alt", /*alt*/ ctx[1]);
				add_location(img, file$4, 13, 6, 429);
			},
			m: function mount(target, anchor) {
				insert_dev(target, img, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*src*/ 1 && !src_url_equal(img.src, img_src_value = /*src*/ ctx[0])) {
					attr_dev(img, "src", img_src_value);
				}

				if (dirty & /*alt*/ 2) {
					attr_dev(img, "alt", /*alt*/ ctx[1]);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(img);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block.name,
			type: "else",
			source: "(13:4) {:else}",
			ctx
		});

		return block;
	}

	// (9:4) {#if href}
	function create_if_block(ctx) {
		let a;
		let img;
		let img_src_value;

		const block = {
			c: function create() {
				a = element("a");
				img = element("img");
				if (!src_url_equal(img.src, img_src_value = /*src*/ ctx[0])) attr_dev(img, "src", img_src_value);
				attr_dev(img, "class", "h-9 rounded-full");
				attr_dev(img, "alt", /*alt*/ ctx[1]);
				add_location(img, file$4, 10, 8, 355);
				attr_dev(a, "href", /*href*/ ctx[2]);
				attr_dev(a, "target", "_blank");
				attr_dev(a, "rel", "noopener noreferrer");
				add_location(a, file$4, 9, 6, 294);
			},
			m: function mount(target, anchor) {
				insert_dev(target, a, anchor);
				append_dev(a, img);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*src*/ 1 && !src_url_equal(img.src, img_src_value = /*src*/ ctx[0])) {
					attr_dev(img, "src", img_src_value);
				}

				if (dirty & /*alt*/ 2) {
					attr_dev(img, "alt", /*alt*/ ctx[1]);
				}

				if (dirty & /*href*/ 4) {
					attr_dev(a, "href", /*href*/ ctx[2]);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(a);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block.name,
			type: "if",
			source: "(9:4) {#if href}",
			ctx
		});

		return block;
	}

	function create_fragment$4(ctx) {
		let div1;
		let div0;

		function select_block_type(ctx, dirty) {
			if (/*href*/ ctx[2]) return create_if_block;
			return create_else_block;
		}

		let current_block_type = select_block_type(ctx);
		let if_block = current_block_type(ctx);

		const block = {
			c: function create() {
				div1 = element("div");
				div0 = element("div");
				if_block.c();
				attr_dev(div0, "class", "flex bg-white rounded-full p-2 justify-center items-center");
				add_location(div0, file$4, 7, 2, 200);
				attr_dev(div1, "class", "group flex w-full cursor-pointer flex-col space-y-2 rounded-2xl bg-neutral-700 p-6 text-left md:w-1/3");
				add_location(div1, file$4, 6, 0, 82);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);
				append_dev(div1, div0);
				if_block.m(div0, null);
			},
			p: function update(ctx, [dirty]) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block.d(1);
					if_block = current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(div0, null);
					}
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div1);
				}

				if_block.d();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$4.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$4($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('PartnerLogo', slots, []);
		let { src } = $$props;
		let { alt } = $$props;
		let { href = null } = $$props;

		$$self.$$.on_mount.push(function () {
			if (src === undefined && !('src' in $$props || $$self.$$.bound[$$self.$$.props['src']])) {
				console.warn("<PartnerLogo> was created without expected prop 'src'");
			}

			if (alt === undefined && !('alt' in $$props || $$self.$$.bound[$$self.$$.props['alt']])) {
				console.warn("<PartnerLogo> was created without expected prop 'alt'");
			}
		});

		const writable_props = ['src', 'alt', 'href'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PartnerLogo> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('src' in $$props) $$invalidate(0, src = $$props.src);
			if ('alt' in $$props) $$invalidate(1, alt = $$props.alt);
			if ('href' in $$props) $$invalidate(2, href = $$props.href);
		};

		$$self.$capture_state = () => ({ src, alt, href });

		$$self.$inject_state = $$props => {
			if ('src' in $$props) $$invalidate(0, src = $$props.src);
			if ('alt' in $$props) $$invalidate(1, alt = $$props.alt);
			if ('href' in $$props) $$invalidate(2, href = $$props.href);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [src, alt, href];
	}

	class PartnerLogo extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$4, create_fragment$4, safe_not_equal, { src: 0, alt: 1, href: 2 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "PartnerLogo",
				options,
				id: create_fragment$4.name
			});
		}

		get src() {
			throw new Error("<PartnerLogo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set src(value) {
			throw new Error("<PartnerLogo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get alt() {
			throw new Error("<PartnerLogo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set alt(value) {
			throw new Error("<PartnerLogo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get href() {
			throw new Error("<PartnerLogo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set href(value) {
			throw new Error("<PartnerLogo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/components/OpenSource.svelte generated by Svelte v4.0.0 */
	const file$3 = "src/components/OpenSource.svelte";

	function create_fragment$3(ctx) {
		let div7;
		let div6;
		let div0;
		let h1;
		let t1;
		let p0;
		let t3;
		let p1;
		let t4;
		let a;
		let t6;
		let t7;
		let div5;
		let div2;
		let div1;
		let partnerlogo0;
		let t8;
		let partnerlogo1;
		let t9;
		let partnerlogo2;
		let t10;
		let div4;
		let div3;
		let partnerlogo3;
		let t11;
		let partnerlogo4;
		let t12;
		let partnerlogo5;
		let current;

		partnerlogo0 = new PartnerLogo({
				props: {
					src: "/uw.svg",
					alt: "Unfolding Word",
					href: "https://www.unfoldingword.org"
				},
				$$inline: true
			});

		partnerlogo1 = new PartnerLogo({
				props: {
					src: "/open-components.svg",
					alt: "Open Components Ecosystem",
					href: "https://opencomponents.io"
				},
				$$inline: true
			});

		partnerlogo2 = new PartnerLogo({
				props: {
					src: "/bcs.png",
					alt: "Bible Collaboration Studio"
				},
				$$inline: true
			});

		partnerlogo3 = new PartnerLogo({
				props: {
					src: "./public/sil.png",
					alt: "SIL International",
					href: "https://www.sil.org"
				},
				$$inline: true
			});

		partnerlogo4 = new PartnerLogo({
				props: {
					src: "./public/biblica.png",
					alt: "Biblica",
					href: "https://www.biblica.com"
				},
				$$inline: true
			});

		partnerlogo5 = new PartnerLogo({
				props: {
					src: "./public/eten-lab.png",
					alt: "ETEN Innovation Lab",
					href: "https://etenlab.notion.site/Welcome-to-the-ETEN-Innovation-Lab-Public-Dashboard-9108ab10278144518ce664a75b57a947"
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				div7 = element("div");
				div6 = element("div");
				div0 = element("div");
				h1 = element("h1");
				h1.textContent = "Open-Source, Collaborative, and Community-Driven";
				t1 = space();
				p0 = element("p");
				p0.textContent = "At Project Accelerate, every contribution, big or small, propels us forward in our mission to bring the power of the Bible to every corner of the world.";
				t3 = space();
				p1 = element("p");
				t4 = text("Read more about our\n        ");
				a = element("a");
				a.textContent = "steering committee";
				t6 = text(".");
				t7 = space();
				div5 = element("div");
				div2 = element("div");
				div1 = element("div");
				create_component(partnerlogo0.$$.fragment);
				t8 = space();
				create_component(partnerlogo1.$$.fragment);
				t9 = space();
				create_component(partnerlogo2.$$.fragment);
				t10 = space();
				div4 = element("div");
				div3 = element("div");
				create_component(partnerlogo3.$$.fragment);
				t11 = space();
				create_component(partnerlogo4.$$.fragment);
				t12 = space();
				create_component(partnerlogo5.$$.fragment);
				attr_dev(h1, "class", "text-3xl font-semibold leading-snug text-white md:text-4xl");
				add_location(h1, file$3, 7, 6, 288);
				attr_dev(p0, "class", "text-neutral-400");
				add_location(p0, file$3, 10, 6, 435);
				attr_dev(a, "class", "text-neutral-300 hover:text-neutral-200");
				attr_dev(a, "href", "https://project-accelerate.gitbook.io/project-accelerate/project-overview/steering-committee");
				attr_dev(a, "target", "_blank");
				add_location(a, file$3, 15, 8, 707);
				attr_dev(p1, "class", "text-neutral-400");
				add_location(p1, file$3, 13, 6, 642);
				attr_dev(div0, "class", "flex max-w-xl flex-col space-y-2");
				add_location(div0, file$3, 6, 4, 235);
				attr_dev(div1, "class", "flex w-full flex-col justify-between space-y-6 md:flex-row md:space-y-0 md:space-x-12");
				add_location(div1, file$3, 20, 8, 1019);
				attr_dev(div2, "class", "flex max-w-6xl");
				add_location(div2, file$3, 19, 6, 982);
				attr_dev(div3, "class", "flex w-full flex-col justify-between space-y-6 md:flex-row md:space-y-0 md:space-x-12");
				add_location(div3, file$3, 27, 8, 1488);
				attr_dev(div4, "class", "mx-auto flex max-w-6xl");
				add_location(div4, file$3, 26, 6, 1443);
				attr_dev(div5, "class", "flex flex-col space-y-6 md:space-y-12");
				add_location(div5, file$3, 18, 4, 924);
				attr_dev(div6, "class", "flex w-full flex-col items-center space-y-12 py-12 text-center md:space-y-24 md:py-32");
				add_location(div6, file$3, 5, 2, 131);
				attr_dev(div7, "class", "mx-auto w-full rounded-xl bg-neutral-800 p-6");
				add_location(div7, file$3, 4, 0, 70);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div7, anchor);
				append_dev(div7, div6);
				append_dev(div6, div0);
				append_dev(div0, h1);
				append_dev(div0, t1);
				append_dev(div0, p0);
				append_dev(div0, t3);
				append_dev(div0, p1);
				append_dev(p1, t4);
				append_dev(p1, a);
				append_dev(p1, t6);
				append_dev(div6, t7);
				append_dev(div6, div5);
				append_dev(div5, div2);
				append_dev(div2, div1);
				mount_component(partnerlogo0, div1, null);
				append_dev(div1, t8);
				mount_component(partnerlogo1, div1, null);
				append_dev(div1, t9);
				mount_component(partnerlogo2, div1, null);
				append_dev(div5, t10);
				append_dev(div5, div4);
				append_dev(div4, div3);
				mount_component(partnerlogo3, div3, null);
				append_dev(div3, t11);
				mount_component(partnerlogo4, div3, null);
				append_dev(div3, t12);
				mount_component(partnerlogo5, div3, null);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(partnerlogo0.$$.fragment, local);
				transition_in(partnerlogo1.$$.fragment, local);
				transition_in(partnerlogo2.$$.fragment, local);
				transition_in(partnerlogo3.$$.fragment, local);
				transition_in(partnerlogo4.$$.fragment, local);
				transition_in(partnerlogo5.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(partnerlogo0.$$.fragment, local);
				transition_out(partnerlogo1.$$.fragment, local);
				transition_out(partnerlogo2.$$.fragment, local);
				transition_out(partnerlogo3.$$.fragment, local);
				transition_out(partnerlogo4.$$.fragment, local);
				transition_out(partnerlogo5.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div7);
				}

				destroy_component(partnerlogo0);
				destroy_component(partnerlogo1);
				destroy_component(partnerlogo2);
				destroy_component(partnerlogo3);
				destroy_component(partnerlogo4);
				destroy_component(partnerlogo5);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$3.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$3($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('OpenSource', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<OpenSource> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ PartnerLogo });
		return [];
	}

	class OpenSource extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "OpenSource",
				options,
				id: create_fragment$3.name
			});
		}
	}

	/* src/components/CallToAction.svelte generated by Svelte v4.0.0 */
	const file$2 = "src/components/CallToAction.svelte";

	function create_fragment$2(ctx) {
		let div3;
		let div2;
		let div0;
		let h1;
		let t1;
		let p0;
		let t3;
		let div1;
		let button;
		let t5;
		let p1;
		let t6;
		let a;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				div3 = element("div");
				div2 = element("div");
				div0 = element("div");
				h1 = element("h1");
				h1.textContent = "Join Our Journey.";
				t1 = space();
				p0 = element("p");
				p0.textContent = "Be a part of an open-source collaborative project that's setting new standards in translation technology.";
				t3 = space();
				div1 = element("div");
				button = element("button");
				button.textContent = "Download Codex for Free";
				t5 = space();
				p1 = element("p");
				t6 = text("Want to learn more?\n        ");
				a = element("a");
				a.textContent = "Conceptual Documentation";
				attr_dev(h1, "class", "text-4xl font-semibold leading-snug tracking-tight md:text-5xl");
				add_location(h1, file$2, 9, 6, 308);
				attr_dev(p0, "class", "text-gray-600");
				add_location(p0, file$2, 12, 6, 428);
				attr_dev(div0, "class", "flex max-w-xl flex-col space-y-4");
				add_location(div0, file$2, 8, 4, 255);
				attr_dev(button, "class", "rounded-md bg-gradient-to-br from-green-400 via-teal-500 to-blue-600 py-2.5 px-8 text-base font-medium text-white hover:from-teal-600 hover:via-teal-500 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-teal-400 animate-gradient-x svelte-z8d8at");
				add_location(button, file$2, 17, 6, 646);
				attr_dev(a, "class", "font-medium text-gray-900 hover:text-gray-500");
				attr_dev(a, "href", "https://project-accelerate.gitbook.io");
				attr_dev(a, "target", "_blank");
				add_location(a, file$2, 25, 8, 1067);
				attr_dev(p1, "class", "text-gray-600");
				add_location(p1, file$2, 23, 6, 1005);
				attr_dev(div1, "class", "max-4xl flex flex-col space-y-4");
				add_location(div1, file$2, 16, 4, 594);
				attr_dev(div2, "class", "flex w-full flex-col items-center space-y-12 py-12 text-center md:py-32");
				add_location(div2, file$2, 7, 2, 165);
				attr_dev(div3, "class", "mx-auto w-full rounded-xl bg-neutral-100 p-6");
				add_location(div3, file$2, 6, 0, 104);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div3, anchor);
				append_dev(div3, div2);
				append_dev(div2, div0);
				append_dev(div0, h1);
				append_dev(div0, t1);
				append_dev(div0, p0);
				append_dev(div2, t3);
				append_dev(div2, div1);
				append_dev(div1, button);
				append_dev(div1, t5);
				append_dev(div1, p1);
				append_dev(p1, t6);
				append_dev(p1, a);

				if (!mounted) {
					dispose = listen_dev(button, "click", scrollToTop, false, false, false, false);
					mounted = true;
				}
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div3);
				}

				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$2.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function instance$2($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('CallToAction', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CallToAction> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ scrollToTop });
		return [];
	}

	class CallToAction extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "CallToAction",
				options,
				id: create_fragment$2.name
			});
		}
	}

	/* src/components/Footer.svelte generated by Svelte v4.0.0 */
	const file$1 = "src/components/Footer.svelte";

	function create_fragment$1(ctx) {
		let div2;
		let div0;
		let img;
		let img_src_value;
		let t0;
		let div1;
		let nav;
		let ul;
		let li0;
		let a0;
		let t2;
		let li1;
		let a1;
		let t4;
		let li2;
		let a2;

		const block = {
			c: function create() {
				div2 = element("div");
				div0 = element("div");
				img = element("img");
				t0 = space();
				div1 = element("div");
				nav = element("nav");
				ul = element("ul");
				li0 = element("li");
				a0 = element("a");
				a0.textContent = "Conceptual Documentation";
				t2 = space();
				li1 = element("li");
				a1 = element("a");
				a1.textContent = "Ideas Blog";
				t4 = space();
				li2 = element("li");
				a2 = element("a");
				a2.textContent = "Contact";
				if (!src_url_equal(img.src, img_src_value = "./public/bible-logo.png")) attr_dev(img, "src", img_src_value);
				attr_dev(img, "class", "h-16 w-16");
				attr_dev(img, "alt", "Bible Logo");
				add_location(img, file$1, 2, 4, 168);
				attr_dev(div0, "class", "flex w-full flex-row justify-between md:w-1/4");
				add_location(div0, file$1, 1, 2, 104);
				attr_dev(a0, "class", "hover:text-gray-500");
				attr_dev(a0, "href", "https://project-accelerate.gitbook.io");
				attr_dev(a0, "target", "_blank");
				add_location(a0, file$1, 8, 10, 450);
				add_location(li0, file$1, 7, 8, 435);
				attr_dev(a1, "class", "hover:text-gray-500");
				attr_dev(a1, "href", "https://ryder.dev");
				add_location(a1, file$1, 15, 10, 655);
				add_location(li1, file$1, 14, 8, 640);
				attr_dev(a2, "class", "hover:text-gray-500");
				attr_dev(a2, "href", "mailto:ryderwishart@gmail.com");
				add_location(a2, file$1, 18, 10, 763);
				add_location(li2, file$1, 17, 8, 748);
				attr_dev(ul, "class", "flex flex-col space-y-1 text-base font-medium text-gray-900 md:flex-row md:space-x-8 md:space-y-0");
				add_location(ul, file$1, 6, 6, 316);
				attr_dev(nav, "id", "nav");
				attr_dev(nav, "class", "w-full px-4 py-4 md:flex");
				add_location(nav, file$1, 5, 4, 262);
				add_location(div1, file$1, 4, 2, 252);
				attr_dev(div2, "class", "flex w-full flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0");
				add_location(div2, file$1, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div2, anchor);
				append_dev(div2, div0);
				append_dev(div0, img);
				append_dev(div2, t0);
				append_dev(div2, div1);
				append_dev(div1, nav);
				append_dev(nav, ul);
				append_dev(ul, li0);
				append_dev(li0, a0);
				append_dev(ul, t2);
				append_dev(ul, li1);
				append_dev(li1, a1);
				append_dev(ul, t4);
				append_dev(ul, li2);
				append_dev(li2, a2);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div2);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$1.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$1($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Footer', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class Footer extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Footer",
				options,
				id: create_fragment$1.name
			});
		}
	}

	/* src/App.svelte generated by Svelte v4.0.0 */
	const file = "src/App.svelte";

	function create_fragment(ctx) {
		let main;
		let header;
		let t0;
		let hero;
		let t1;
		let features;
		let t2;
		let translationtools;
		let t3;
		let opensource;
		let t4;
		let calltoaction;
		let t5;
		let footer;
		let current;
		header = new Header({ $$inline: true });
		hero = new Hero({ $$inline: true });
		features = new Features({ $$inline: true });
		translationtools = new TranslationTools({ $$inline: true });
		opensource = new OpenSource({ $$inline: true });
		calltoaction = new CallToAction({ $$inline: true });
		footer = new Footer({ $$inline: true });

		const block = {
			c: function create() {
				main = element("main");
				create_component(header.$$.fragment);
				t0 = space();
				create_component(hero.$$.fragment);
				t1 = space();
				create_component(features.$$.fragment);
				t2 = space();
				create_component(translationtools.$$.fragment);
				t3 = space();
				create_component(opensource.$$.fragment);
				t4 = space();
				create_component(calltoaction.$$.fragment);
				t5 = space();
				create_component(footer.$$.fragment);
				attr_dev(main, "class", "flex flex-col space-y-8 p-4 md:p-8");
				add_location(main, file, 10, 0, 417);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, main, anchor);
				mount_component(header, main, null);
				append_dev(main, t0);
				mount_component(hero, main, null);
				append_dev(main, t1);
				mount_component(features, main, null);
				append_dev(main, t2);
				mount_component(translationtools, main, null);
				append_dev(main, t3);
				mount_component(opensource, main, null);
				append_dev(main, t4);
				mount_component(calltoaction, main, null);
				append_dev(main, t5);
				mount_component(footer, main, null);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(header.$$.fragment, local);
				transition_in(hero.$$.fragment, local);
				transition_in(features.$$.fragment, local);
				transition_in(translationtools.$$.fragment, local);
				transition_in(opensource.$$.fragment, local);
				transition_in(calltoaction.$$.fragment, local);
				transition_in(footer.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(header.$$.fragment, local);
				transition_out(hero.$$.fragment, local);
				transition_out(features.$$.fragment, local);
				transition_out(translationtools.$$.fragment, local);
				transition_out(opensource.$$.fragment, local);
				transition_out(calltoaction.$$.fragment, local);
				transition_out(footer.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(main);
				}

				destroy_component(header);
				destroy_component(hero);
				destroy_component(features);
				destroy_component(translationtools);
				destroy_component(opensource);
				destroy_component(calltoaction);
				destroy_component(footer);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('App', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({
			Header,
			Hero,
			Features,
			TranslationTools,
			OpenSource,
			CallToAction,
			Footer
		});

		return [];
	}

	class App extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "App",
				options,
				id: create_fragment.name
			});
		}
	}

	const app = new App({
		target: document.body,
		props: {
			name: 'world'
		}
	});

	return app;

})();
//# sourceMappingURL=bundle.js.map
