<script lang="ts">
  // Extension file metadata
  const extensions = [
    {
      name: 'Codex Editor Extension',
      version: '0.3.12',
      filename: 'codex-editor-extension-0.3.12.vsix',
    },
    {
      name: 'Frontier Authentication',
      version: '0.3.3',
      filename: 'frontier-authentication-0.3.3.vsix',
    },
    {
      name: 'Shared State Store',
      version: '0.0.2',
      filename: 'shared-state-store-0.0.2.vsix',
    },
  ];
</script>

<svelte:head>
  <title>Download Codex Extensions</title>
</svelte:head>

<div class="flex flex-col items-center justify-center max-w-3xl mx-auto mt-12">
  <h1 class="text-3xl font-bold mb-6">Download Codex Extensions</h1>

  <div class="file-section">
    <h2 class="text-2xl font-semibold mb-4">Installation Instructions</h2>
    <p>
      You'll need to install all three extensions below for Codex to work
      properly:
    </p>
    <div class="my-6 flex flex-col items-center gap-4">
      {#each extensions as extension}
        <a href={extension.filename} class="download-button" download>
          <svg
            class="download-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span
            >{extension.name}
            <span class="version">v{extension.version}</span></span
          >
        </a>
      {/each}
    </div>
    <p>To install each extension:</p>
    <ol class="text-left mx-10 my-4">
      <li>
        Press <code>Ctrl+Shift+P</code> (Windows/Linux) or
        <code>Cmd+Shift+P</code> (Mac) to open the Command Palette
      </li>
      <li>Type "Install from VSIX" and select that option</li>
      <li>Choose the downloaded .vsix file</li>
    </ol>
    <p>
      After installing all extensions, please close and reopen VS Code for the
      changes to take effect.
    </p>
  </div>

  <div class="note">
    <p>
      <strong>Note:</strong> The Open VSX marketplace is currently experiencing
      an outage (as of April 23rd). Their team is working to restore services as
      quickly as possible. For the latest updates, please visit
      <a href="https://status.open-vsx.org">status.open-vsx.org</a>.
    </p>
  </div>
</div>

<style>
  .download-button {
    display: flex;
    align-items: center;
    gap: 12px;
    background-color: #4f46e5;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
    width: 100%;
    max-width: 400px;
    transition: all 0.2s ease;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .download-button:hover {
    background-color: #4338ca;
    transform: translateY(-2px);
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .download-icon {
    width: 20px;
    height: 20px;
  }

  .version {
    opacity: 0.8;
    font-size: 0.9em;
    margin-left: 4px;
  }

  .file-section {
    margin: 20px auto;
    max-width: 600px;
  }

  .note {
    background-color: #fff3cd;
    border: 1px solid #ffeeba;
    border-radius: 4px;
    color: #856404;
    margin: 20px auto;
    max-width: 600px;
    padding: 15px;
    text-align: left;
  }

  .note p {
    margin: 0;
  }

  .note a {
    color: #856404;
    text-decoration: underline;
  }

  .note a:hover {
    color: #533f03;
  }

  li {
    margin-bottom: 10px;
    margin-left: 10px;
    margin-right: 10px;
    margin-top: 10px;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.5;
    list-style-type: disc;
    list-style-position: inside;
    text-align: left;
    padding-left: 10px;
    padding-right: 10px;
  }
</style>
