use rocket::data::{
    self,
    Outcome::{Failure, Success},
    FromData, ToByteUnit,
};
use rocket::http::Status;
use rocket::request::Request;
use serde::Deserialize;

#[derive(FromForm, Deserialize)]
pub struct Bot<'r> {
    id: &'r str,
    username: &'r str,
    public: bool,
}

#[derive(FromForm, Deserialize)]
pub struct CustomIhorizon<'r> {
    auth: &'r str,
    owner_one: &'r str,
    owner_two: Option<&'r str>,
    expire_in: u128,
    bot: Bot<'r>,
    admin_key: &'r str,
    code: &'r str,
}

#[rocket::async_trait]
impl<'r> FromData<'r> for Bot<'r> {
    type Error = String;

    async fn from_data(req: &'r Request<'_>, data: Data<'r>) -> data::Outcome<'r, Self> {
        match serde_urlencoded::from_reader::<Bot<'r>, _>(data.open(10.megabytes())) {
            Ok(custom) => data::Outcome::Success(custom),
            Err(_) => {
                data::Outcome::Failure((Status::BadRequest, "Invalid data format".to_string()))
            }
        }
    }
}



impl<'r> CustomIhorizon<'r> {
    pub fn new() -> Self {
        Self {
            auth: "",
            owner_one: "",
            owner_two: None,
            expire_in: 0,
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

#[rocket::async_trait]
impl<'r> FromData<'r> for CustomIhorizon<'r> {
    type Error = String;

    async fn from_data(req: &'r Request<'_>, data: Data<'r>) -> data::Outcome<'r, Self> {
        match serde_urlencoded::from_reader::<CustomIhorizon<'r>, _>(data.open(10.megabytes())) {
            Ok(custom) => data::Outcome::Success(custom),
            Err(_) => {
                data::Outcome::Failure((Status::BadRequest, "Invalid data format".to_string()))
            }
        }
    }
}
