// Allow `cargo stylus export-abi` to generate a main function.
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
extern crate alloc;

use stylus_sdk::{alloy_primitives::U256, prelude::*, msg, storage::StorageU256};
use alloc::{string::String, vec::Vec};

use openzeppelin_stylus::token::erc721::Erc721;


#[entrypoint]
#[storage]
pub struct GameOfLifeNFT {
    #[borrow]
    pub erc721: Erc721,
    pub token_supply: StorageU256,
}

#[public]
#[inherit(Erc721)]
impl GameOfLifeNFT {
    pub fn mint(&mut self) -> Result<(), Vec<u8>> {
        let to = msg::sender();
        let token_id = self.token_supply.get() + U256::from(1);
        self.token_supply.set(token_id);
        Ok(self.erc721._mint(to, token_id)?)
    }

    pub fn name(&self) -> Result<String, Vec<u8>> {
        Ok(String::from("Game of Life"))
    }

    pub fn symbol(&self) -> Result<String, Vec<u8>> {
        Ok(String::from("GOL"))
    }

    #[selector(name = "tokenURI")]
    pub fn token_uri(&self, token_id: U256) -> Result<String, Vec<u8>> {
        let seed = token_id.as_limbs()[0];
        let size = 32;
        let generations = 64; //64 works with decent performances, 128 works but the browser is slow ,  512 & 1024 out of gas error
        let cell_size = 4;

        let mut svg = String::with_capacity(size * size * 32);
        svg.push_str(
            r#"<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><style>
            @keyframes gol_pulse {
                0% {opacity:0}
                20% {opacity:1}
                80% {opacity:1}
                100% {opacity:0}
            }
            @keyframes gol_last {
                0% {opacity:0}
                20% {opacity:1}
                100% {opacity:1}
            }
            .gol-cell {fill:#000;opacity:0;animation:gol_pulse 500ms forwards}
            .gol-cell.last {animation:gol_last 500ms forwards}
            </style>"#,
        );

        // Create dynamic grid
        let mut grid = vec![vec![false; size]; size];
        let mut has_cells = false;

        // Initialize first generation from seed
        for y in 0..size {
            for x in 0..size {
                let v = ((x ^ y) + ((x | y) & (size - 1)) + (seed as usize)) & (size - 1);
                if v < size / 3 {
                    grid[y][x] = true;
                    svg.push_str(&format!(
                        r#"<rect class="gol-cell" x="{}" y="{}" width="{}" height="{}" style="animation-delay:0ms"/>"#,
                        x * cell_size + 1, y * cell_size + 1, cell_size - 1, cell_size - 1
                    ));
                }
            }
        }

        // Compute and render next generations
        for gen in 1..generations {
            let mut next = vec![vec![false; size]; size];
            let mut next_has_cells = false;

            for y in 0..size {
                for x in 0..size {
                    let mut neighbors = 0;
                    for dy in -1..=1 {
                        for dx in -1..=1 {
                            if dx == 0 && dy == 0 {
                                continue;
                            }
                            let nx = (x as i32 + dx).rem_euclid(size as i32) as usize;
                            let ny = (y as i32 + dy).rem_euclid(size as i32) as usize;
                            if grid[ny][nx] {
                                neighbors += 1;
                            }
                        }
                    }
                    next[y][x] = matches!((grid[y][x], neighbors),
                        (true, 2) | (true, 3) | (false, 3));
                    if next[y][x] {
                        next_has_cells = true;
                        let is_last = has_cells && gen == generations - 1;
                        svg.push_str(&format!(
                            r#"<rect class="gol-cell{}" x="{}" y="{}" width="{}" height="{}" style="animation-delay:{}ms"/>"#,
                            if is_last { " last" } else { "" },
                            x * cell_size + 1,
                            y * cell_size + 1,
                            cell_size - 1,
                            cell_size - 1,
                            gen * 400
                        ));
                    }
                }
            }
            grid = next;
            has_cells = next_has_cells;
        }

        svg.push_str("</svg>");
        Ok(svg)
    }
}

#[cfg(test)]
mod tests {
    use crate::GameOfLifeNFT;
    use openzeppelin_stylus::token::erc721::IErc721;
    use stylus_sdk::alloy_primitives::{address, uint};

    #[motsu::test]
    fn initial_balance_is_zero(contract: GameOfLifeNFT) {
        let test_address = address!("1234567891234567891234567891234567891234");
        let token_id = uint!(10_U256);

        let _ = contract.erc721._mint(test_address, token_id);
        let owner = contract.erc721.owner_of(token_id).unwrap();
        assert_eq!(owner, test_address);
    }
}
