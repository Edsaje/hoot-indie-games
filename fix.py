# -*- coding: utf-8 -*-
with open('src/services/chatService.ts', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('since: number = 0', '_since: number = 0')
with open('src/services/chatService.ts', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/services/userCloudSyncService.ts', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('fetchUserCloudSave(identifiers:', 'fetchUserCloudSave(_identifiers:')
content = content.replace('options?: { strategy:', '_options?: { strategy:')
content = content.replace('options?: { strategy', '_options?: { strategy')
content = content.replace('acknowledgeAdminReward(rewardId', 'acknowledgeAdminReward(_rewardId')
with open('src/services/userCloudSyncService.ts', 'w', encoding='utf-8') as f:
    f.write(content)