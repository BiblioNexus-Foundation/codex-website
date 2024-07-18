<script lang="ts">
  export let icon: 'message-circle' | 'hash' | 'wifi-off' | 'check-circle' | 'cloud' | 'settings';
  export let title: string;
  export let description: string;
</script>

<div class="flex flex-col space-y-2 text-left">
  <svg class="w-8 h-8 sm:w-10 sm:h-10 mx-auto sm:mx-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {#if icon === 'message-circle'}
      <path d="M10.6667 15.9999H10.68M16 15.9999H16.0133M21.3333 15.9999H21.3467M28 15.9999C28 21.891 22.6274 26.6666 16 26.6666C13.9476 26.6666 12.0156 26.2086 10.3262 25.4013L4 26.6666L5.85999 21.7066C4.68209 20.0564 4 18.099 4 15.9999C4 10.1089 9.37258 5.33325 16 5.33325C22.6274 5.33325 28 10.1089 28 15.9999Z" stroke="#A3A3A3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    {:else if icon === 'hash'}
      <path d="M9.33325 26.6666L14.6666 5.33325M17.3333 26.6666L22.6666 5.33325M7.99992 11.9999H26.6666M5.33325 19.9999H23.9999" stroke="#A3A3A3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    {:else if icon === 'wifi-off'}
      <path d="M21.3333 10.6666V21.3333M15.9999 14.6666V21.3333M10.6666 18.6666V21.3333M7.99992 26.6666H23.9999C25.4727 26.6666 26.6666 25.4727 26.6666 23.9999V7.99992C26.6666 6.52716 25.4727 5.33325 23.9999 5.33325H7.99992C6.52716 5.33325 5.33325 6.52716 5.33325 7.99992V23.9999C5.33325 25.4727 6.52716 26.6666 7.99992 26.6666Z" stroke="#A3A3A3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    {:else if icon === 'check-circle'}
      <path d="M12 16L14.6667 18.6667L20 13.3333M28 16C28 22.6274 22.6274 28 16 28C9.37258 28 4 22.6274 4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16Z" stroke="#A3A3A3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    {:else if icon === 'cloud'}
      <path d="M4 20.0001C4 22.9456 6.38781 25.3334 9.33333 25.3334H21.3333C25.0152 25.3334 28 22.3486 28 18.6667C28 14.9848 25.0152 12.0001 21.3333 12.0001C21.2889 12.0001 21.2445 12.0005 21.2002 12.0014C20.5831 8.95775 17.8924 6.66675 14.6667 6.66675C10.9848 6.66675 8 9.65152 8 13.3334C8 13.8359 8.05559 14.3253 8.16094 14.796C5.77942 15.3302 4 17.4573 4 20.0001Z" stroke="#A3A3A3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    {:else if icon === 'settings'}
      <path d="M21.3333 16C21.3333 13.0545 18.9455 10.6667 16 10.6667C13.0545 10.6667 10.6667 13.0545 10.6667 16C10.6667 18.9455 13.0545 21.3333 16 21.3333C18.9455 21.3333 21.3333 18.9455 21.3333 16ZM21.3333 16V18C21.3333 19.841 22.8257 21.3333 24.6667 21.3333C26.5076 21.3333 28 19.841 28 18V16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28M22 26.3923C20.1067 27.4854 18.0394 28.0039 15.9999 28.002" stroke="#A3A3A3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    {/if}
  </svg>

  <div class="max-w-sm">
    <p class="font-medium">{title}</p>
    <p class="font-normal text-neutral-600">
      {description}
    </p>
  </div>
</div>