<script lang="ts">
  import PartnerLogo from './PartnerLogo.svelte';
</script>

<div class="mx-auto w-full rounded-xl bg-neutral-800 p-6">
  <div class="flex w-full flex-col items-center space-y-12 py-12 text-center md:space-y-24 md:py-32">
    <div class="flex max-w-xl flex-col space-y-2">
      <h1 class="text-3xl font-semibold leading-snug text-white md:text-4xl">
        Open-Source, Collaborative, and Community-Driven
      </h1>
      <p class="text-neutral-400">
        At Project Accelerate, every contribution, big or small, propels us forward in our mission to bring the power of the Bible to every corner of the world.
      </p>
      <p class="text-neutral-400">
        Read more about our
        <a class="text-neutral-300 hover:text-neutral-200" href="https://project-accelerate.gitbook.io/project-accelerate/project-overview/steering-committee" target="_blank" rel="noopener noreferrer">steering committee</a>.
      </p>
    </div>
    <div class="flex flex-col space-y-6 md:space-y-12">
      <div class="flex max-w-6xl">
        <div class="flex w-full flex-col justify-between space-y-6 md:flex-row md:space-y-0 md:space-x-12">
          <PartnerLogo src="/uw.svg" alt="Unfolding Word" href="https://www.unfoldingword.org" />
          <PartnerLogo src="/open-components.svg" alt="Open Components Ecosystem" href="https://opencomponents.io" />
          <PartnerLogo src="/bcs.png" alt="Bible Collaboration Studio" />
        </div>
      </div>
      <div class="mx-auto flex max-w-6xl">
        <div class="flex w-full flex-col justify-between space-y-6 md:flex-row md:space-y-0 md:space-x-12">
          <PartnerLogo src="/sil.png" alt="SIL International" href="https://www.sil.org" />
          <PartnerLogo src="/biblica.png" alt="Biblica" href="https://www.biblica.com" />
          <PartnerLogo src="/eten-lab.png" alt="ETEN Innovation Lab" href="https://etenlab.notion.site/Welcome-to-the-ETEN-Innovation-Lab-Public-Dashboard-9108ab10278144518ce664a75b57a947" />
        </div>
      </div>
    </div>
  </div>
</div>