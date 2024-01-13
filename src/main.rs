#[macro_use]
extern crate rocket;
use serde::Deserialize;

mod database;
mod ihorizon;
#[get("/web")]
fn hello() -> &'static str {
    "hellow world"
}

#[get("/bo?")]
fn jesuismagnifique() -> &'static str {
    "jsais bbou"
}

#[post("/new_ihorizon", data = "<bot>")]
fn create_new_custom_bot(bot: ihorizon::CustomIhorizon) -> &'static str {
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
