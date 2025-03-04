import mysql from 'mysql2/promise';
import {
    DB_HOST,
    DB_USER,
    DB_PORT,
    DB_PASSWORD,
    DB_NAME
} from '$env/static/private';

export async function createConnection() {
    return mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        port: DB_PORT,
        password: DB_PASSWORD,
        database: DB_NAME
    });
}