import json
with open('src/lessons.json', 'r') as f:
    data = json.load(f)
categories = {}
for l in data['lessons']:
    parts = l['rule'].split(' » ')
    top = parts[0]
    if top not in categories:
        categories[top] = []
    if len(parts) > 1 and parts[1] not in categories[top]:
        categories[top].append(parts[1])
with open('scratch_cat.txt', 'w') as f:
    for k, v in categories.items():
        f.write(k + '\n')
        for sub in v:
            f.write('  - ' + sub + '\n')
