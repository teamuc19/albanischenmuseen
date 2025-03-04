import { createConnection } from '$lib/mysql.js';


const USERNAME = 'Tea';
const PASSWORD = 'Svelte';

// Endpoint to handle requests for all museums
export async function GET() {
   

    const connection = await createConnection();
    const [rows] = await connection.execute('SELECT * FROM museums');
    await connection.end();

    return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { 'content-type': 'application/json' }
    });
}

// Endpoint to create a new museum
export async function POST({ request }) {
    // Authentication
    const authHeader = this.headers.get('authorization');
    if (!authHeader || !isValidCredentials(authHeader)) {
        return new Response('Unauthorized', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' }
        });
    }

    const connection = await createConnection();
    const body = await request.json();

    // Validation
    if (!body.name || !body.location || !body.description || !body.image_url) {
        await connection.end();
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { 'content-type': 'application/json' }
        });
    }

    // Insert into database
    const [result] = await connection.execute(
        'INSERT INTO museums (name, location, description, image_url) VALUES (?, ?, ?, ?);',
        [body.name, body.location, body.description, body.image_url]
    );

    // Prepare response object
    const newMuseum = {
        id: result.insertId,
        name: body.name,
        location: body.location,
        description: body.description,
        image_url: body.image_url
    };

    await connection.end();
    return new Response(JSON.stringify(newMuseum), {
        status: 201,
        headers: { 'content-type': 'application/json' }
    });
}

// Helper function to validate credentials from Basic Auth header
function isValidCredentials(authHeader) {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = atob(base64Credentials);
    const [username, password] = credentials.split(':');
    return username === USERNAME && password === PASSWORD;
}