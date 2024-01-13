#[macro_use]
extern crate rocket;
use serde::Deserialize;
use std::{env, fs, os};
use rocket::serde::{json::Json};
mod database;
mod ihorizon;
use ihorizon::CustomIhorizon;
use ihorizon::CustomCli;

#[get("/web")]
fn hello() -> &'static str {
    "hellow world"
}

#[get("/bo?")]
fn jesuismagnifique() -> &'static str {
    "jsais bbou"
}
#[post("/new_ihorizon", data = "<bot>")]
fn create_new_custom_bot(bot: Json<ihorizon::CustomIhorizon<'_>>) -> &'static str {
    let code = bot.code;
    let pwd = env::var("PWD").unwrap();
    if fs::metadata(format!("{pwd}/ownihrz/{}", code)).is_ok() {
        return "code already exists";
    }
    fs::create_dir_all(format!("{pwd}/ownihrz/{}", code));
    let cli_array: Vec<CustomCli> = vec![
        CustomCli {
            line: "git clone --branch ownihrz --depth 1 https://github.com/ihrz/ihrz.git .".to_string(),
            pwd: format!("{pwd}/ownihrz/{}", code),
        },
        CustomCli {
            line: "mv src/files/config.example.ts src/files/config.ts".to_string(),
            pwd: format!("{pwd}/ownihrz/{}", code),
        },
        CustomCli {
            line: format!(r#"sed -i 's/|| "The bot token",/|| "{}",/g' config.ts"#, bot.auth), // jsp pour le autg
            pwd: format!("{pwd}/ownihrz/{}/src/files", code),
        },
        CustomCli {
            line: format!(r#"sed -i 's/"The discord User ID of the Owner number One",/"{}",/' config.ts"#, bot.owner_one),
            pwd: format!("{pwd}/ownihrz/{}/src/files", code),
        },
        CustomCli {
            line: format!(r#"sed -i 's/"The discord User ID of the Owner number Two",/"{}",/' config.ts"#, if let Some(owner_two) = bot.owner_two { owner_two } else { "0"}),
            pwd: format!("{pwd}/ownihrz/{}/src/files", code),
        },
        CustomCli {
            line: format!(r#"sed -i 's/"The API'"'"'s token for create a request (Need to be private for security reason)",/"{}",/' config.ts"#, bot.auth), // pas le bon parametre
            pwd: format!("{pwd}/ownihrz/{}/src/files", code),
        },
        CustomCli {
            line: format!(r#"sed -i 's/"The client ID of your application"/"{}"/' config.ts"#, bot.bot.id),
            pwd: format!("{pwd}/ownihrz/{}/src/files", code),
        },
        CustomCli {
            line: format!(r#"sed -i 's/"3000"/"{}"/' config.ts"#, 29268), // hard codée le port
            pwd: format!("{pwd}/ownihrz/{}/src/files", code),
        },
        CustomCli {  
            line: "npx tsc".to_string(),
            pwd: format!("{pwd}/ownihrz/{}/src", code),
        },
        CustomCli {
            line: format!(r#"mv dist/index.js dist/{}.js"#, code),
            pwd: format!("{pwd}/ownihrz/{}/src", code),
        },
        CustomCli {
            line: format!(r#"pm2 start ./dist/{}.js -f"#, code),
            pwd: format!("{pwd}/ownihrz/{}/src", code),
        }
    ];

    for cli in cli_array {
        match cli.execute() {
            Ok(_) => (),
            Err(e) => println!("{e}"),
        }
    }
    ""
}



#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![hello, jesuismagnifique])
}

/*
DB= DB IHORIZON WITH URL

{
  auth: 'MTE1OTQ2NDE5Njk1ODg1NTE5OQ.G-ndtx.ah1hmhco220YJZBraeAJk1OHjboMLIXhvqKdfM',
  owner_one: '171356978310938624',
  owner_two: '761966322497880084',
  expireIn: 1707768742275,
  bot: {
    id: '1159464196958855199',
    username: 'OwnIhrz example',
    public: true
  },
  admin_key: 'f?38y8H~r4.2,xYxM+RG-zN3',
  code: '47dqpgvnp9'
}
TYPING:

{
  auth: string,
  owner_one: string,
  owner_two: string,
  expireIn: int,
  bot: {
    id: string,
    username: string,
    public: boolean
  },
  admin_key: string,
  code: string
}
*/
