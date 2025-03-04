import { createConnection } from '$lib/mysql.js';

// Authentication credentials (replace with environment variables in production)
const USERNAME = 'Tea';
const PASSWORD = 'Svelte';

// Endpoint to handle requests for an individual museum
export async function GET({ params }) {
    const authHeader = this.headers.get('authorization');
    if (!authHeader || !isValidCredentials(authHeader)) {
        return new Response('Unauthorized', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' }
        });
    }

    const connection = await createConnection();
    const [rows] = await connection.execute(
        'SELECT * FROM museums WHERE id = ?',
        [params.uuid]
    );
    await connection.end();

    return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { 'content-type': 'application/json' }
    });
}

// POST endpoint to create a new museum (redundant with /museen POST)
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

// DELETE endpoint to remove a museum
export async function DELETE({ params }) {
    const authHeader = this.headers.get('authorization');
    if (!authHeader || !isValidCredentials(authHeader)) {
        return new Response('Unauthorized', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' }
        });
    }

    const connection = await createConnection();
    const id = parseInt(params.uuid, 10);

    try {
        const [result] = await connection.execute(
            'DELETE FROM museums WHERE id = ?;',
            [id]
        );

        if (result.affectedRows === 0) {
            await connection.end();
            return new Response(JSON.stringify({ error: 'Museum not found' }), {
                status: 404,
                headers: { 'content-type': 'application/json' }
            });
        }

        await connection.end();
        return new Response(null, {
            status: 204,
            headers: { 'content-type': 'application/json' }
        });
    } catch (error) {
        await connection.end();
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'content-type': 'application/json' }
        });
    }
}

// PUT endpoint to update a museum
export async function PUT({ params, request }) {
    const authHeader = this.headers.get('authorization');
    if (!authHeader || !isValidCredentials(authHeader)) {
        return new Response('Unauthorized', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' }
        });
    }

    const connection = await createConnection();
    const { uuid } = params;
    const id = parseInt(uuid, 10);

    try {
        const body = await request.json();

        // Validation
        if (!body.name || !body.location || !body.description || !body.image_url) {
            await connection.end();
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'content-type': 'application/json' }
            });
        }

        // Update the database
        const [result] = await connection.execute(
            'UPDATE museums SET name = ?, location = ?, description = ?, image_url = ? WHERE id = ?;',
            [body.name, body.location, body.description, body.image_url, id]
        );

        if (result.affectedRows === 0) {
            await connection.end();
            return new Response(JSON.stringify({ error: 'Museum not found' }), {
                status: 404,
                headers: { 'content-type': 'application/json' }
            });
        }

        // Prepare response
        const updatedMuseum = {
            id,
            name: body.name,
            location: body.location,
            description: body.description,
            image_url: body.image_url
        };

        await connection.end();
        return new Response(JSON.stringify(updatedMuseum), {
            status: 200,
            headers: { 'content-type': 'application/json' }
        });
    } catch (error) {
        await connection.end();
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'content-type': 'application/json' }
        });
    }
}

// Helper function to validate credentials from Basic Auth header
function isValidCredentials(authHeader) {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = atob(base64Credentials);
    const [username, password] = credentials.split(':');
    return username === USERNAME && password === PASSWORD;
}