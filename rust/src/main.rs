#[macro_use]
extern crate rocket;
use serde::Deserialize;
use std::fmt::format;
use std::{env, fs, os};
use rocket::serde::json::Json;
mod database;
mod ihorizon;
use ihorizon::{CustomIhorizon, Bot};
use ihorizon::CustomCli;


#[post("/new_ihorizon", data = "<bot>")]
fn create_new_custom_bot(bot: Json<ihorizon::cryptedJSON<'_>>) -> &'static str {

    // a coder: 

        // let { cryptedJSON } = req.body;

        // var bytes = CryptoJS.AES.decrypt(cryptedJSON, config.api.apiToken);
        // var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        // let {
        //     admin_key,
        //     auth,
        //     owner_one,
        //     owner_two,
        //     bot,
        //     expireIn,
        //     code
        // } = decryptedData;


            
        let code = ihorizon::cryptedJSON::decrypt("f?38y8H~r4.2,xYxM+RG-zN3", bot);
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
            line: format!(r#"sed -i 's/|| "The bot token",/|| "{}",/g' config.ts"#, auth), // jsp pour le autg
            pwd: format!("{pwd}/ownihrz/{}/src/files", code),
        },
        CustomCli {
            line: format!(r#"sed -i 's/"The discord User ID of the Owner number One",/"{}",/' config.ts"#, owner_one),
            pwd: format!("{pwd}/ownihrz/{}/src/files", code),
        },
        CustomCli {
            line: format!(r#"sed -i 's/"The discord User ID of the Owner number Two",/"{}",/' config.ts"#, if let Some(owner_two) = owner_two { owner_two } else { "0"}),
            pwd: format!("{pwd}/ownihrz/{}/src/files", code),
        },
        CustomCli {
            line: format!(r#"sed -i 's/"The API'"'"'s token for create a request (Need to be private for security reason)",/"{}",/' config.ts"#, auth), // pas le bon parametre
            pwd: format!("{pwd}/ownihrz/{}/src/files", code),
        },
        CustomCli {
            line: format!(r#"sed -i 's/"The client ID of your application"/"{}"/' config.ts"#, bot_id),
            pwd: format!("{pwd}/ownihrz/{}/src/files", code),
        },
        CustomCli {
            line: format!(r#"sed -i 's/"3000"/"{}"/' config.ts"#, 29268), // hard codée le port
            pwd: format!("{pwd}/ownihrz/{}/src/files", code),
        },
        CustomCli {
            line: format!("sed -i 's/\"blacklistPictureInEmbed\": \"The image of the blacklist'\\''s Embed (When blacklisted user attempt to interact with the bot)\",\"blacklistPictureInEmbed\": \"https:\\/\\/media.discordapp.net\\/attachments\\/1099043567659384942\\/1119214828330950706\\/image.png\",/' config.ts"),
            pwd: format!("{pwd}/ownihrz/{}/src/files", code)
        },
        CustomCli {
            line: format!("cp -r ./node_modules/ ./ownihrz/{code}/node_modules/"),
            pwd: format!("{pwd}"),
        },
        CustomCli {  
            line: "npx tsc".to_string(),
            pwd: format!("{pwd}/ownihrz/{}", code),
        },
        CustomCli {
            line: format!(r#"mv dist/index.js dist/{}.js"#, code),
            pwd: format!("{pwd}/ownihrz/{}/", code),
        },
        CustomCli {
            line: format!(r#"pm2 start ./dist/{}.js -f"#, code),
            pwd: format!("{pwd}/ownihrz/{}/", code),
        }
    ];

    for cli in cli_array {
        match cli.execute() {
            Ok(_) => println!("Success : {}", cli.line),
            Err(e) => println!("Error Happened to : {} {e}", cli.line),
        }
    }
    ""
}



#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![create_new_custom_bot])
}

/*
DB= DB IHORIZON WITH URL

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