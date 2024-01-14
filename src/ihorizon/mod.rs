use rocket::data::{self, FromData, ToByteUnit};
use rocket::http::Status;
use rocket::request::Request;
use serde::Deserialize;
use std::process::Command;


pub struct cryptedJSON {
    pub cryptedJSON: String,
}


#[serde(crate = "rocket::serde")]
#[derive(FromForm, Deserialize)]
pub struct Bot<'r> {
    pub id: &'r str,
    pub username: &'r str,
    pub public: bool,
}

pub struct CustomCli {
    pub line: String,
    pub pwd: String,
}

#[serde(crate = "rocket::serde")]
#[derive(FromForm, Deserialize)]
pub struct CustomIhorizon<'r> {
    pub auth: &'r str,
    pub owner_one: &'r str,
    pub owner_two: Option<&'r str>,
    pub expireIn: u128,
    pub bot: Bot<'r>,
    pub admin_key: &'r str,
    pub code: &'r str,
}

impl<'r> CustomIhorizon<'r> {
    pub fn new() -> Self {
        Self {
            auth: "",
            owner_one: "",
            owner_two: None,
            expireIn: 0,
            bot: Bot {
                id: "",
                username: "",
                public: false,
            },
            admin_key: "",
            code: "",
        }
    }
}

impl CustomCli {
    pub fn new(line: String, pwd: String) -> Self {
        Self { line, pwd }
    }

    pub fn execute(&self) -> std::io::Result<std::process::Output> {
        Command::new("sh")
            .arg("-c")
            .arg(&self.line)
            .current_dir(&self.pwd)
            .output()
    }
}
