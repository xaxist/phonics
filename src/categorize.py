import json
with open('src/lessons.json', 'r') as f:
    data = json.load(f)
for i, l in enumerate(data['lessons']):
    if i % 15 == 0:
        print(f"Lesson {i+1}: {l['rule'][:60]}...")
