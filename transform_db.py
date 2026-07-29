import json
import os

with open('src/lessons.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

worlds = [
  { "id": 1, "name": "Short Vowel Valley", "description": "Learn the short and snappy vowel sounds!", "lessons": [] },
  { "id": 2, "name": "The Blend Beach", "description": "When consonants hang out together!", "lessons": [] },
  { "id": 3, "name": "Digraph Desert", "description": "Two letters, one brand new sound!", "lessons": [] },
  { "id": 4, "name": "Magic 'E' Mountain", "description": "The silent ninja 'E' makes vowels say their name!", "lessons": [] },
  { "id": 5, "name": "Vowel Team Tropics", "description": "When two vowels go walking...", "lessons": [] },
  { "id": 6, "name": "R-Controlled River", "description": "Watch out for the bossy 'R'!", "lessons": [] },
  { "id": 7, "name": "Multi-Syllable Meadow", "description": "Big words, prefixes, and suffixes!", "lessons": [] }
]

current_world = 0

for i, lesson in enumerate(data['lessons']):
    rule = lesson['rule'].lower()
    if 'blend' in rule:
        current_world = 1
    elif 'digraph' in rule:
        current_world = 2
    elif 'silent e' in rule or 'vowel-consonant-e' in rule or 'magic e' in rule:
        current_world = 3
    elif 'vowel team' in rule or 'open syllable' in rule or 'diphthong' in rule:
        current_world = 4
    elif 'r-controlled' in rule or 'bossy r' in rule:
        current_world = 5
    elif 'suffix' in rule or 'prefix' in rule or 'multisyllabic' in rule or 'complex' in rule:
        current_world = 6
    elif 'short vowel' in rule or 'closed syllable' in rule:
        current_world = 0
        
    lesson['id'] = f"lesson_{i+1}"
    worlds[current_world]['lessons'].append(lesson)

with open('src/database.json', 'w', encoding='utf-8') as f:
    json.dump({ "worlds": worlds }, f, indent=2)

print("Created src/database.json")
