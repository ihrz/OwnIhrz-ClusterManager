use rocket::data::{self, FromData, ToByteUnit};
use rocket::http::Status;
use rocket::request::Request;
use serde::Deserialize;
use std::process::Command;
use aes::Aes128;
use cipher::{BlockDecrypt, BlockEncrypt, BlockCipher};
use cipher::generic_array::GenericArray;
use cipher::StreamCipher ;

#[serde(crate = "rocket::serde")]
#[derive(FromForm, Deserialize)]
pub struct cryptedJSON<'r> {
    pub cryptedJSON: &'r str,
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


impl cryptedJSON<'_> {
    pub fn new(cryptedJSON: &str) -> Self {
        Self { cryptedJSON }
    }

    pub fn decrypt(&self, key: &[u8]) -> Vec<u8> {
        // Ensure the key length is appropriate for AES-128
        assert_eq!(key.len(), 16, "Key length must be 16 bytes for AES-128");

        // Create AES cipher instance
        let cipher = Aes128::new(GenericArray::from_slice(key));

        // Process the input in blocks of 16 bytes
        let mut decrypted_text = Vec::with_capacity(self.cryptedJSON.len());
        for chunk in self.cryptedJSON.as_bytes().chunks_exact(16) {
            // Create a block to hold the encrypted data
            let mut block = GenericArray::clone_from_slice(chunk);

            // Decrypt the block
            cipher.decrypt_block(&mut block);

            // Append the decrypted block to the result
            decrypted_text.extend_from_slice(&block);
        }

        decrypted_text
    }

}