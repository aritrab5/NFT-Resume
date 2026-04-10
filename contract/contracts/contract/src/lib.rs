#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Env, Address, String};

#[contract]
pub struct NFTResume;

#[derive(Clone)]
#[contracttype]
pub struct Resume {
    pub name: String,
    pub skills: String,
    pub experience: String,
    pub portfolio: String,
}

#[contracttype]
pub enum DataKey {
    Resume(u64),
    Owner(u64),
    Counter,
}

#[contractimpl]
impl NFTResume {

    // Mint a new NFT Resume
    pub fn mint(env: Env, user: Address, resume: Resume) -> u64 {
        user.require_auth();

        let mut id: u64 = env.storage().instance().get(&DataKey::Counter).unwrap_or(0);
        id += 1;

        env.storage().instance().set(&DataKey::Resume(id), &resume);
        env.storage().instance().set(&DataKey::Owner(id), &user);
        env.storage().instance().set(&DataKey::Counter, &id);

        id
    }

    // Get Resume Data
    pub fn get_resume(env: Env, id: u64) -> Option<Resume> {
        env.storage().instance().get(&DataKey::Resume(id))
    }

    // Get Owner
    pub fn owner_of(env: Env, id: u64) -> Option<Address> {
        env.storage().instance().get(&DataKey::Owner(id))
    }

    // Transfer Ownership
    pub fn transfer(env: Env, from: Address, to: Address, id: u64) {
        from.require_auth();

        let owner: Address = env.storage().instance().get(&DataKey::Owner(id)).unwrap();

        if owner != from {
            panic!("Not owner");
        }

        env.storage().instance().set(&DataKey::Owner(id), &to);
    }
}