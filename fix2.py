# -*- coding: utf-8 -*-
with open('src/services/chatService.ts', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('since}', '_since}')
content = content.replace('since,', '_since,')
with open('src/services/chatService.ts', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/services/userCloudSyncService.ts', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('options?.force', '_options?.force')
content = content.replace('options?.strategy', '_options?.strategy')
with open('src/services/userCloudSyncService.ts', 'w', encoding='utf-8') as f:
    f.write(content)