use std::{
    cell::RefCell,
    collections::{HashMap, HashSet},
    sync::OnceLock,
};

use wasm_bindgen::prelude::*;

fn parse_messages(content: &str) -> Vec<String> {
    content
        .split('\n')
        .filter_map(|row| row.split_once(" - "))
        .map(|(_, rest)| match rest.split_once(": ") {
            Some((_, message)) => message,
            None => rest,
        })
        .map(|message| message.to_string())
        .collect()
}

fn generate_words_map(messages: &[String]) -> HashMap<String, i32> {
    let mut map: HashMap<String, i32> = HashMap::new();

    for message in messages {
        for word in message.to_lowercase().split(' ') {
            let cleaned = word.trim_matches(|c: char| !c.is_alphanumeric());

            if cleaned.is_empty() {
                continue;
            }

            *map.entry(cleaned.to_string()).or_insert(0) += 1;
        }
    }

    map
}

fn stopwords() -> &'static HashSet<String> {
    static STOPWORDS: OnceLock<HashSet<String>> = OnceLock::new();

    STOPWORDS.get_or_init(|| {
        let words: Vec<String> = serde_json::from_str(include_str!("../assets/it.json"))
            .expect("embedded assets/it.json should be valid json");

        words.into_iter().collect()
    })
}

fn order_and_clean_map(map: HashMap<String, i32>) -> Vec<(String, i32)> {
    let stopwords = stopwords();

    let mut entries: Vec<(String, i32)> = map.into_iter().collect();

    entries.sort_by(|a, b| b.1.cmp(&a.1));

    entries
        .into_iter()
        .filter(|(word, _)| word.len() > 3 && !stopwords.contains(word))
        .collect()
}

fn pick_by_probability(entries: &[(String, i32)], random_unit: f64) -> Option<String> {
    let total: i32 = entries.iter().map(|(_, count)| count).sum();

    if total <= 0 {
        return None;
    }

    let mut choice = (random_unit * total as f64) as i32;

    for (word, count) in entries {
        if choice < *count {
            return Some(word.clone());
        }

        choice -= count;
    }

    entries.last().map(|(word, _)| word.clone())
}

thread_local! {
    static ENTRIES: RefCell<Vec<(String, i32)>> = const { RefCell::new(Vec::new()) };
}

/// Parses a chat export and stores its word-frequency table for later use by `pick_word`.
#[wasm_bindgen]
pub fn import_chat(content: &str) {
    let messages = parse_messages(content);
    let map = generate_words_map(&messages);
    let entries = order_and_clean_map(map);

    ENTRIES.with(|cell| *cell.borrow_mut() = entries);
}

/// Picks a word out of the most recently imported chat, weighted by how often it occurs.
#[wasm_bindgen]
pub fn pick_word() -> Option<String> {
    ENTRIES.with(|cell| pick_by_probability(&cell.borrow(), js_sys::Math::random()))
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE_CHAT: &str = "\
02/04/23, 12:14 AM - Yuri ha creato il gruppo \"Pasquetta\"
02/04/23, 12:15 AM - Yuri: Andiamo alla partita stasera
02/04/23, 12:16 AM - Elena: Sì, andiamo alla partita insieme
02/04/23, 12:17 AM - Yuri: partita partita partita";

    #[test]
    fn parses_sender_and_system_lines() {
        let messages = parse_messages(SAMPLE_CHAT);

        assert_eq!(messages.len(), 4);
        assert_eq!(messages[0], "Yuri ha creato il gruppo \"Pasquetta\"");
        assert_eq!(messages[1], "Andiamo alla partita stasera");
    }

    #[test]
    fn counts_words_case_insensitively() {
        let messages = parse_messages(SAMPLE_CHAT);
        let map = generate_words_map(&messages);

        assert_eq!(map.get("partita").copied(), Some(5));
        assert_eq!(map.get("andiamo").copied(), Some(2));
    }

    #[test]
    fn drops_short_words_and_stopwords() {
        let messages = parse_messages(SAMPLE_CHAT);
        let map = generate_words_map(&messages);
        let entries = order_and_clean_map(map);

        assert!(entries.iter().all(|(word, _)| word.len() > 3));
        assert!(!entries.iter().any(|(word, _)| word == "alla"));
        assert_eq!(entries[0].0, "partita");
    }

    #[test]
    fn pick_by_probability_respects_the_random_roll() {
        let entries = vec![("uno".to_string(), 1), ("due".to_string(), 3)];

        assert_eq!(pick_by_probability(&entries, 0.0), Some("uno".to_string()));
        assert_eq!(pick_by_probability(&entries, 0.99), Some("due".to_string()));
    }

    #[test]
    fn pick_by_probability_returns_none_when_empty() {
        assert_eq!(pick_by_probability(&[], 0.5), None);
    }
}
