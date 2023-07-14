import { Knex } from "knex";


//adds users, API Keys and assigns 1 CREATE_API_KEY role to first API key

export async function seed(knex: Knex): Promise<void> {
    // Deletes existing entries for clean slate (testing environment)
    await knex("nerfbot.roles").del();
    await knex("nerfbot.api_keys").del();
    await knex("nerfbot.users").del();


    // Inserts users into users table
    await knex("nerfbot.users").insert([
        { userId: 1, username: "mario"},
        { userId: 2, username: "luigi"},
        { userId: 3, username: "yoshi"}
    ]);


    // Inserts API Keys into api_keys table
    await knex("nerfbot.api_keys").insert([
        { apiKeyId: 1, userId: 1 },
        { apiKeyId: 2, userId: 2 },
        { apiKeyId: 3, userId: 3 },

    ]);

    // Inserts role CREATE_API_KEY to first API Key
    await knex("nerfbot.roles").insert([
        { apiKey: knex("nerfbot.api_keys").select('apiKey').first(), role: "CREATE_API_KEY" },

    ]);
};
