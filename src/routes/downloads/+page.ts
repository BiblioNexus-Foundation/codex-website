import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
    const res = await fetch('/api/latest-release');
    const releaseData = await res.json();

    return {
        releaseData
    };
};