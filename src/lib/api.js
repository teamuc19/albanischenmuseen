export async function fetchMuseums() {
    const response = await fetch('/Api/Museen', {
        headers: {
            'Authorization': `Basic ${btoa('admin:secret')}`
        }
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    return await response.json();
}