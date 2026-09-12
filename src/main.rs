use std::{
    collections::{HashMap, HashSet, LinkedList},
    fs,
};

struct Message {
    timestamp: String,
    sender: String,
    message: String,
}

type History = LinkedList<Message>;

fn parse_messages(content: String) -> History {
    let mut list: History = LinkedList::new();

    for row in content.split("\n") {
        let Some((timestamp, rest)) = row.split_once(" - ") else {
            continue;
        };

        let (sender, message) = match rest.split_once(": ") {
            Some((sender, message)) => (sender, message),
            None => ("", rest),
        };

        list.push_back(Message {
            timestamp: timestamp.to_string(),
            sender: sender.to_string(),
            message: message.to_string(),
        });
    }

    return list;
}

fn generate_words_map(history: History) -> HashMap<String, i32> {
    let mut map: HashMap<String, i32> = HashMap::new();

    for message in &history {
        for word in message.message.to_lowercase().split(" ") {
            let cleaned = word.trim_matches(|c: char| !c.is_alphanumeric());

            if cleaned.is_empty() {
                continue;
            }

            *map.entry(cleaned.to_string()).or_insert(0) += 1;
        }
    }

    return map;
}

fn load_stopwords() -> HashSet<String> {
    let content =
        fs::read_to_string("/Users/michelesaladino/Documents/code/chat-alayzer/assets/it.json")
            .expect("failed to read assets/it.json");

    let words: Vec<String> =
        serde_json::from_str(&content).expect("failed to parse assets/it.json");

    return words.into_iter().collect();
}

fn order_and_clean_map(map: HashMap<String, i32>) -> Vec<(String, i32)> {
    let stopwords = load_stopwords();

    let mut entries: Vec<(String, i32)> = map.into_iter().collect();

    entries.sort_by(|a, b| b.1.cmp(&a.1));

    return entries
        .into_iter()
        .filter(|x| x.0.len() > 3 && !stopwords.contains(&x.0.to_lowercase()))
        .collect();
}

fn pick_by_probability(entries: Vec<(String, i32)>) -> String {
    let total: i32 = entries.iter().map(|(_, count)| count).sum();

    let mut choice = rand::random_range(0..total);

    for (word, count) in &entries {
        if choice < *count {
            return word.clone();
        }

        choice -= count;
    }

    unreachable!("choice should always land on a word");
}

fn main() {
    let content =
        match fs::read_to_string("/Users/michelesaladino/Documents/code/chat-alayzer/test.txt") {
            Ok(c) => c,
            Err(err) => {
                println!("{}", err);
                return;
            }
        };

    let messages = parse_messages(content);
    let map = generate_words_map(messages);
    let entries = order_and_clean_map(map);

    println!("{}", pick_by_probability(entries));
}
