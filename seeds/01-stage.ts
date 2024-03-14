import { Knex } from 'knex'

//adds users, API Keys and assigns 1 CREATE_API_KEY role to first API key

export async function seed(knex: Knex): Promise<void> {
    // Deletes existing entries for clean slate (testing environment)
    await knex("nerfbot.roles").del();
    await knex("nerfbot.api_keys").del();
    await knex("nerfbot.users").del();


    // Inserts users into users table
    await knex("nerfbot.users").insert([
        { username: "jim" },
        { username: "rob" },
        { username: "grog" }
    ]);

    const userIds = await knex('nerfbot.users').select('userId')

    // Inserts API Keys into api_keys table
    await knex("nerfbot.api_keys").insert(userIds);

    const apiKeys = await knex("nerfbot.api_keys")
      .select<{ apiKey: string }[]>('apiKey')

    // Inserts role CREATE_API_KEY to first API Key
    await knex("nerfbot.roles").insert(
      apiKeys.map(({ apiKey }) => ({ apiKey, role: 'CREATE_API_KEY' }))
    )
};
