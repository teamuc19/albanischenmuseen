<script>
	import { onMount } from 'svelte';
	import { fetchMuseums } from '$lib/api.js';

	let museums = [];

	onMount(async () => {
		museums = await fetchMuseums();
	});
</script>

<h1>Museums in Albania</h1>
{#each museums as museum}
	<div class="card">
		<h3>{museum.name}</h3>
		<p>Location: {museum.location}</p>
		<p>Desc: {museum.description}</p>
		<img src={museum.image_url} alt={museum.name} width="200" />
	</div>
{/each}
