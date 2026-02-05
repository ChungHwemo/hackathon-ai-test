# カインズ ハッカソン 完全ガイド
## テーマ：価値あるプロダクトを早く届ける

**作成日**: 2026年2月5日  
**チーム**: 4名（Salesforce 2名、開発者 2名）  
**開発時間**: 40人時（4名 × 10時間）

---

# 目次

| # | セクション | 内容 |
|---|-----------|------|
| 1 | [ハッカソン概要](#1-ハッカソン概要) | テーマ、チーム構成、技術制約 |
| 2 | [テーマの解釈](#2-テーマの解釈) | A：開発者生産性 vs B：店舗運営 |
| 3 | [MVP候補A：開発者生産性](#3-mvp候補a開発者生産性向上) | AIコードレビュー、複雑度ダッシュボード等 |
| 4 | [MVP候補B：店舗運営](#4-mvp候補b店舗運営効率化) | インシデントレポート、チェックリスト等 |
| 5 | [カインズDX現況](#5-カインズdx現況) | 既存システム、未デジタル化領域 |
| 6 | [競合他社分析](#6-競合他社分析) | Walmart、Target、日本企業 |
| 7 | [推奨MVP詳細](#7-推奨mvpインシデントレポートアプリ) | 機能、期待効果、定量的インパクト |
| 8 | [技術アーキテクチャ](#8-技術アーキテクチャ) | システム構成、Salesforce連携 |
| 9 | [TDD・複雑度ガイド](#9-tdd複雑度ガイドライン) | Kent Beck TDD、ESLint設定 |
| 10 | [開発タイムライン](#10-開発タイムライン) | 10時間スケジュール |
| 11 | [プレゼンガイド](#11-プレゼンテーションガイド) | 5分発表構成、デモシナリオ |
| 12 | [技術セットアップ](#12-技術セットアップ) | 事前準備、プロジェクト構造 |
| 13 | [AI調査プロンプト](#13-ai調査プロンプト集) | 追加調査用プロンプト |

---

# 1. ハッカソン概要

## 1.1 テーマ情報

| 項目 | 内容 |
|------|------|
| **メインテーマ** | 価値あるプロダクトを早く届ける |
| **課題** | プロダクトの開発生産性を向上させる、なにかしらのモノ・仕組み |
| **重視点** | スピードと価値 ＞ 完成度 |
| **成果物** | モック、ストーリーボード、デモ、プレゼン |
| **技術制約** | なし（言語・プラットフォーム自由） |

## 1.2 チーム構成

| 役割 | 人数 | スキル |
|------|------|--------|
| フロントエンド開発 | 1名 | React/Ionic、PWA |
| バックエンド開発 | 1名 | Node.js、Firebase |
| Salesforce開発 1 | 1名 | Apex、LWC、API |
| Salesforce開発 2 | 1名 | Flow、レポート、ダッシュボード |

## 1.3 技術制約

| 制約 | 値 | 根拠 |
|------|-----|------|
| 循環的複雑度 | ≤ 10 | シンプルでテスト可能な関数 |
| 認知的複雑度 | ≤ 15 | SonarSource推奨閾値 |
| 開発時間 | 40人時 | ハッカソン制限 |
| TDDスタイル | Kent Beck | Red-Green-Refactor |

---

# 2. テーマの解釈

## 2.1 二つの解釈

ハッカソンテーマ「プロダクトの開発生産性を向上させる」は二通りに解釈可能：

### 解釈A：開発者生産性（狭義）

> **対象**: エンジニア・開発チーム  
> **焦点**: コーディング、テスト、デプロイの効率向上  
> **例**: AIコードレビュー、自動テスト、PR自動化

### 解釈B：店舗運営生産性（広義）

> **対象**: 店舗従業員 + 顧客  
> **焦点**: 問題解決の高速化 → 顧客価値の迅速な提供  
> **例**: インシデントレポート、チェックリスト、タスク管理

## 2.2 ストーリーテリング接続

解釈Bを選択した場合のテーマ接続：

> 「開発生産性向上 = 価値あるプロダクトを早く届ける」  
> 「= 現場で発生する問題をリアルタイムで把握し解決する」  
> 「= インシデントレポートアプリで報告から対応開始まで87%短縮」

---

# 3. MVP候補A：開発者生産性向上

## 3.1 AIコードレビューアシスタント

| 項目 | 内容 |
|------|------|
| **説明** | PRを自動レビューし、改善点を提案 |
| **期待効果** | レビュー待ち時間50%削減 |
| **開発時間** | 8-10時間 |
| **技術スタック** | OpenAI/Claude API + GitHub Actions |

**機能**:
- コードスメル自動検出
- セキュリティ脆弱性スキャン
- スタイル一貫性チェック
- 修正提案と説明

---

## 3.2 複雑度ダッシュボード

| 項目 | 内容 |
|------|------|
| **説明** | コードベース複雑度のリアルタイム監視 |
| **期待効果** | CC≤10、CoC≤15の維持 |
| **開発時間** | 6-8時間 |
| **技術スタック** | ESLint + SonarJS + React |

**機能**:
- ファイル別複雑度スコア
- 時系列トレンドグラフ
- 閾値超過アラート
- リファクタリング提案

---

## 3.3 開発環境セットアップ自動化

| 項目 | 内容 |
|------|------|
| **説明** | 新メンバーの環境構築をワンクリックで完了 |
| **期待効果** | オンボーディング：1日 → 30分 |
| **開発時間** | 6-8時間 |
| **技術スタック** | Docker + シェルスクリプト |

---

## 3.4 テストカバレッジアラートBot

| 項目 | 内容 |
|------|------|
| **説明** | PRでカバレッジ変化時にSlack通知 |
| **期待効果** | 80%以上カバレッジ維持 |
| **開発時間** | 4-6時間 |
| **技術スタック** | GitHub Actions + Slack API |

---

## 3.5 PR自動ラベリング・アサイン

| 項目 | 内容 |
|------|------|
| **説明** | コードオーナーシップに基づく自動レビュアー割当 |
| **期待効果** | PRアサイン60%高速化 |
| **開発時間** | 4-6時間 |

---

## 3.6 ドキュメント自動生成

| 項目 | 内容 |
|------|------|
| **説明** | コードコメントからAPIドキュメント自動生成 |
| **期待効果** | ドキュメント作成時間70%削減 |
| **開発時間** | 6-8時間 |

---

# 4. MVP候補B：店舗運営効率化

## 4.1 Tier 1：高インパクト＋迅速開発（★★★★★）

### 4.1.1 店舗オープン/クローズチェックリストPWA

| 項目 | 内容 |
|------|------|
| **説明** | 開店・閉店の必須作業をデジタル化 |
| **参考事例** | Target、Trail App、Home Depot |
| **開発時間** | 6-8時間 |
| **期待効果** | 時間83%削減、コンプライアンス100% |

**機能構成**:
```
├── オープンチェックリスト（15-20項目）
│   ├── セキュリティシステム解除 ✓
│   ├── 照明・空調確認 ✓
│   ├── レジ開放 ✓
│   └── 清潔状態確認 ✓
├── クローズチェックリスト（15-20項目）
├── 写真添付機能
├── 完了時間自動記録
└── 管理者ダッシュボード（未完了店舗アラート）
```

**定量的効果**:
```
店舗数：256店舗
日次使用：2回（開店＋閉店）
時間短縮：25分/回
年間節約：256 × 2 × 365 × 25分 = 約77,000時間/年
```

⚠️ **リスク**：カインズに既存システムがあるか確認必要

---

### 4.1.2 インシデントレポートアプリ ⭐ 推奨

| 項目 | 内容 |
|------|------|
| **説明** | 写真＋GPS＋プッシュ通知で問題を即時報告 |
| **参考事例** | SafetyCulture (iAuditor)、Auror |
| **開発時間** | 4-6時間 |
| **期待効果** | 対応87%高速化、報告漏れ0% |

**機能構成**:
```
├── インシデントタイプ選択
│   ├── 安全事故
│   ├── 設備故障
│   ├── 顧客クレーム
│   └── その他
├── 写真・動画添付
├── GPS位置自動取得
├── 緊急度設定（低/中/高/緊急）
├── 担当者へプッシュ通知
├── 対応ステータス追跡
└── Salesforceダッシュボード
```

**定量的効果**:
```
店舗数：256店舗
月間節約：18時間/店舗（記録10h + 分析8h）
年間節約：256 × 18 × 12 = 55,296時間/年
コスト削減：55,296 × ¥1,500 = 約8,300万円/年
```

✅ **推奨理由**:
- 既存システムとの重複リスク最低
- 法的コンプライアンス価値
- 定量的効果が明確
- デモ映え（写真＋GPS＋通知）

---

### 4.1.3 シフトスワップ＆可用性アプリ

| 項目 | 内容 |
|------|------|
| **説明** | 従業員間のデジタルシフト交換 |
| **参考事例** | Walmart Me@Walmart、Target myTime |
| **開発時間** | 8-10時間 |
| **期待効果** | シフト調整時間80%削減 |

⚠️ **リスク**：既存スケジューリングシステムと重複の可能性

---

### 4.1.4 社内FAQ/ナレッジベース

| 項目 | 内容 |
|------|------|
| **説明** | 検索可能なオンボーディング・マニュアルDB |
| **参考事例** | Amazon Q、IKEA AI研修 |
| **開発時間** | 6-8時間 |
| **期待効果** | Q&A対応時間70%削減 |

---

## 4.2 Tier 2：中程度インパクト（★★★★☆）

| # | 名称 | 説明 | 開発時間 |
|---|------|------|----------|
| 5 | 在庫QRスキャナー | 商品スキャン → 在庫・位置表示 | 6-8h |
| 6 | 店舗お知らせボード | 本社→店舗通知＋既読確認 | 4-6h |
| 7 | マイクロトレーニング | 3-5分の短時間教育モジュール | 6-8h |
| 8 | 日次タスク管理 | 店長→従業員タスク割当 | 8-10h |

## 4.3 Tier 3：特化機能（★★★☆☆）

| # | 名称 | 説明 | 開発時間 |
|---|------|------|----------|
| 9 | 可用性登録 | 勤務可能時間の事前登録 | 4-6h |
| 10 | キャッシュアウト報告 | デジタルレジ精算 | 3-4h |
| 11 | 在庫補充アラート | 低在庫通知 | 6-8h |
| 12 | 同僚称賛アプリ | 感謝メッセージ送信 | 4-6h |

---

# 5. カインズDX現況

## 5.1 既存システム

| システム | 年 | 機能 | 状況 |
|---------|-----|------|------|
| **Find in CAINZ** | 2019 | 店員用商品検索アプリ | ✅ 2万人利用 |
| **スケジューリング最適化** | 2021 | 自動レジ割当 | ✅ 運用中 |
| **カインズ顧客アプリ** | - | 会員証、在庫照会、バーコード | ✅ 573万会員 |
| **スマートフロアナビ** | 2025 | AIサイネージ（年間8,000時間節約） | ✅ 吉川美南店 |
| **AMRロボット** | 2025 | 自律走行搬送ロボット | ✅ 吉川美南店 |
| **24時間無人店舗** | 2025 | キャッシュレス決済 | ✅ 吉川美南店 |

## 5.2 DX目標

- **人時生産性**：20%向上目標
- **店舗運営効率化**：AI・ロボット活用による省人化

## 5.3 未デジタル化の可能性が高い領域

| 領域 | 可能性 | 根拠 |
|------|--------|------|
| **インシデントレポート** | ★★★★★ | 調査で言及なし |
| **オープン/クローズチェックリスト** | ★★★★☆ | 調査で言及なし |
| **同僚称賛・フィードバック** | ★★★★☆ | 新しいEX領域 |
| シフトスワップ | ★★☆☆☆ | スケジューリングシステム既存 |
| 商品検索 | ★☆☆☆☆ | Find in CAINZ既存 |

---

# 6. 競合他社分析

## 6.1 グローバル競合

### Walmart - Me@Walmart

| 項目 | 内容 |
|------|------|
| **ローンチ** | 2021年6月 |
| **規模** | 74万人以上の従業員 |
| **端末** | Samsung Galaxy XCover Pro無償提供 |
| **主要機能** | スケジュール、シフトスワップ、Ask Sam（音声AI）、タスク、給与明細 |

### Target - myTime

| 項目 | 内容 |
|------|------|
| **開発** | 自社開発（Built for Target by Target） |
| **ダウンロード** | 10万以上（Google Play） |
| **主要機能** | スケジュール、可用性、シフトカバー、シフトピックアップ |

### Home Depot - Sidekick

| 項目 | 内容 |
|------|------|
| **技術** | ML基盤タスク優先順位付け |
| **主要機能** | 商品位置、在庫、タスク管理 |

## 6.2 日本国内競合

| 会社 | システム | 主要機能 |
|------|---------|----------|
| **ニトリ** | 自社開発（内製化80%以上） | アプリリニューアル、CRM、データ分析 |
| **イオン** | AIワーク + MaIボード | AIシフト生成（70%時間削減）、デジタル公知 |
| **コメリ** | コメリアプリ | 在庫照会、店内ナビ、チラシ通知 |
| **コーナン** | コーナンアプリ | 会員証、クーポン、DIY動画 |

## 6.3 インシデントレポート専用ソフトウェア

| ソフトウェア | 評価 | 特徴 |
|-------------|------|------|
| **SafetyCulture (iAuditor)** | 4.6/5 | 監査、チェックリスト、分析 |
| **GoCanvas** | - | Salesforce連携、テンプレート |
| **TARGPatrol** | - | 巡回、監査、タスク統合 |
| **FORM.com** | - | AI画像認識、コンプライアンス |

---

# 7. 推奨MVP：インシデントレポートアプリ

## 7.1 選定理由

| 基準 | スコア | 理由 |
|------|--------|------|
| 重複リスク | ★★★★★ | カインズに類似システムなし |
| 40時間で完成可能 | ★★★★★ | シンプルなCRUD＋プッシュ |
| TDD適用しやすさ | ★★★★★ | 明確なビジネスルール |
| Salesforce連携価値 | ★★★★★ | レポート/ダッシュボード活用 |
| デモ映え | ★★★★☆ | 写真＋GPS＋通知 |

## 7.2 MVPスコープ

### 必須機能（P0）

| # | 機能 | 担当 | 工数 |
|---|------|------|------|
| 1 | インシデント登録（写真+説明+GPS） | フロント+バック | 4h |
| 2 | インシデント一覧表示 | フロントエンド | 2h |
| 3 | 担当者へプッシュ通知 | バックエンド | 2h |
| 4 | Salesforceデータ同期 | Salesforce開発 | 4h |
| 5 | Salesforceレポート | Salesforce開発 | 2h |

### あると良い機能（P1）

| # | 機能 | 担当 | 工数 |
|---|------|------|------|
| 6 | ステータス更新（対応中→完了） | フロント+バック | 2h |
| 7 | オフライン対応 | フロントエンド | 2h |
| 8 | Salesforceダッシュボード | Salesforce開発 | 2h |

## 7.3 期待効果

| 指標 | Before | After | 改善率 |
|------|--------|-------|--------|
| 報告漏れ率 | 10-20% | 0% | **100%** |
| 報告→対応開始 | 2時間 | 15分 | **87%** |
| 紙記録管理工数 | 10h/店舗/月 | 0h | **100%** |
| 分析・レポート作成 | 8h/月 | 自動 | **100%** |

**年間節約効果**：約55,000時間 = 約8,300万円/年

---

# 8. 技術アーキテクチャ

## 8.1 システム概要

```
┌─────────────────────────────────────────────────────────────┐
│                        PWA Frontend                         │
│                  (React + Vite + Ionic)                     │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ レポート作成 │  │   一覧表示   │  │  ステータス │          │
│  │    画面     │  │    画面     │  │   更新画面  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Firebase Backend                         │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Firestore  │  │   Storage   │  │     FCM     │          │
│  │   (データ)   │  │   (画像)    │  │  (プッシュ)  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Salesforce Platform                       │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Custom Obj  │  │   Reports   │  │ Dashboards  │          │
│  │(インシデント)│  │   (集計)    │  │   (可視化)  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## 8.2 技術スタック

### フロントエンド
```yaml
フレームワーク: React 18 + Vite 5
UI: Ionic Framework 7
状態管理: React Query + Zustand
テスト: Vitest + Testing Library
PWA: Vite PWA Plugin + Workbox
カメラ: Navigator.mediaDevices API
位置情報: Geolocation API
```

### バックエンド
```yaml
データベース: Firebase Firestore
ストレージ: Firebase Storage
認証: Firebase Authentication
関数: Cloud Functions (Node.js 18)
プッシュ: Firebase Cloud Messaging
テスト: Vitest + Firebase Emulator
```

### Salesforce
```yaml
オブジェクト: Incident__c、Store__c
自動化: Flow Builder
レポート: Standard Report Builder
ダッシュボード: Lightning Dashboard
連携: REST API via Cloud Functions
認証: OAuth 2.0 JWT Bearer Flow
```

## 8.3 Salesforceデータモデル

### Incident__c カスタムオブジェクト

| Field API Name | 型 | 説明 |
|----------------|-----|------|
| Name | Auto Number | INC-{0000} |
| Type__c | Picklist | safety / equipment / customer / other |
| Description__c | Long Text Area | 詳細説明 |
| Severity__c | Picklist | low / medium / high / critical |
| Status__c | Picklist | reported / in_progress / resolved / closed |
| Store__c | Lookup(Store__c) | 店舗参照 |
| Reporter__c | Lookup(User) | 報告者 |
| Location_Latitude__c | Number | GPS緯度 |
| Location_Longitude__c | Number | GPS経度 |
| Image_URL__c | URL | Firebase Storage画像URL |
| External_Id__c | Text (External ID) | Firebase Document ID |

## 8.4 Firebase ↔ Salesforce連携コード

```typescript
// functions/src/syncToSalesforce.ts
// 循環的複雑度: 4、認知的複雑度: 6

import * as functions from 'firebase-functions';
import { SalesforceClient } from './salesforce/client';

interface Incident {
  id: string;
  type: string;
  description: string;
  severity: string;
  location: { lat: number; lng: number };
  imageUrl?: string;
}

export const syncIncidentToSalesforce = functions.firestore
  .document('incidents/{incidentId}')
  .onCreate(async (snapshot, context) => {
    const incident = snapshot.data() as Incident;
    const incidentId = context.params.incidentId;

    const salesforceData = mapToSalesforceFormat(incident, incidentId);
    
    try {
      await SalesforceClient.createIncident(salesforceData);
      await snapshot.ref.update({ syncedToSalesforce: true });
    } catch (error) {
      console.error('Salesforce sync failed:', error);
      await snapshot.ref.update({ syncError: error.message });
    }
  });

function mapToSalesforceFormat(incident: Incident, externalId: string) {
  return {
    Type__c: incident.type,
    Description__c: incident.description,
    Severity__c: incident.severity,
    Location_Latitude__c: incident.location.lat,
    Location_Longitude__c: incident.location.lng,
    Image_URL__c: incident.imageUrl || null,
    External_Id__c: externalId,
    Status__c: 'reported',
  };
}
```

---

# 9. TDD・複雑度ガイドライン

## 9.1 Kent Beck TDDサイクル

```
1. RED:    失敗するテストを書く
2. GREEN:  テストを通す最小限のコードを書く
3. REFACTOR: コードを整理する（テストは緑のまま）
```

## 9.2 テスト例

```typescript
// 1. RED: まずテストを書く
describe('IncidentService', () => {
  it('必須フィールドでインシデント作成できる', async () => {
    const incident = {
      type: 'equipment_failure',
      description: '空調機故障',
      location: { lat: 35.6812, lng: 139.7671 },
      imageUrl: 'https://...',
    };
    
    const result = await incidentService.create(incident);
    
    expect(result.id).toBeDefined();
    expect(result.status).toBe('reported');
    expect(result.createdAt).toBeDefined();
  });
  
  it('説明なしのインシデントは拒否される', async () => {
    const incident = { type: 'equipment_failure' };
    
    await expect(incidentService.create(incident))
      .rejects.toThrow('Description is required');
  });
});

// 2. GREEN: テストを通す最小限のコード
// 3. REFACTOR: 複雑度を確認しながらリファクタリング
```

## 9.3 循環的複雑度 ≤ 10 の維持方法

| テクニック | 説明 |
|-----------|------|
| **Early return** | 条件を満たさなければ早期リターン |
| **関数分割** | 1関数 = 1責任 |
| **ポリモーフィズム** | switch/caseの代わりにオブジェクトマップ |
| **ガード節** | ネストを避ける |

```typescript
// ❌ 複雑度が高い（CC = 12+）
function processIncident(incident) {
  if (incident) {
    if (incident.type) {
      if (incident.type === 'safety') {
        if (incident.severity === 'high') {
          // 深いネスト...
        }
      }
    }
  }
}

// ✅ 複雑度が低い（CC = 3）
function processIncident(incident) {
  if (!incident) return { error: 'Invalid incident' };
  if (!incident.type) return { error: 'Type required' };
  
  return processIncidentByType(incident);
}

function processIncidentByType(incident) {
  const handlers = {
    safety: processSafetyIncident,
    equipment: processEquipmentIncident,
    customer: processCustomerIncident,
  };
  
  const handler = handlers[incident.type] || processDefaultIncident;
  return handler(incident);
}
```

## 9.4 認知的複雑度 ≤ 15 の維持方法

| 要因 | 加算値 | 対策 |
|------|--------|------|
| if/else/switch | +1 | ガード節で早期リターン |
| ネスト | +1 per level | フラット化、関数抽出 |
| 論理演算子 | +1 | 変数に抽出 |
| ループ内条件 | +1 | filter/map/reduce使用 |

```typescript
// ❌ 認知的複雑度が高い
function getUrgentIncidents(incidents) {
  const result = [];
  for (let i = 0; i < incidents.length; i++) {      // +1
    if (incidents[i].status !== 'closed') {          // +2 (ネスト)
      if (incidents[i].severity === 'high' ||        // +3 (ネスト + ||)
          incidents[i].severity === 'critical') {
        result.push(incidents[i]);
      }
    }
  }
  return result;
}

// ✅ 認知的複雑度が低い
const isUrgent = (incident) =>
  ['high', 'critical'].includes(incident.severity);

const isOpen = (incident) =>
  incident.status !== 'closed';

function getUrgentIncidents(incidents) {
  return incidents
    .filter(isOpen)
    .filter(isUrgent);
}
```

## 9.5 ESLint設定

```javascript
// .eslintrc.js
module.exports = {
  extends: ['plugin:sonarjs/recommended'],
  plugins: ['sonarjs'],
  rules: {
    'complexity': ['error', { max: 10 }],
    'sonarjs/cognitive-complexity': ['error', 15],
    'max-depth': ['error', 3],
    'max-lines-per-function': ['error', 50],
  }
};
```

---

# 10. 開発タイムライン

## 10.1 並行作業スケジュール（10時間）

```
時間     | フロントエンド    | バックエンド      | SF開発1          | SF開発2
─────────────────────────────────────────────────────────────────────────────
0:00-    | 環境セットアップ  | Firebase設定      | SF Org設定       | SF Org設定
0:30     | Vite + Ionic     | Firestore Rules   | Custom Object    | Custom Object
─────────────────────────────────────────────────────────────────────────────
0:30-    | UI設計           | データモデル定義   | Incident__c作成  | Flow設計
1:30     | ワイヤーフレーム  | TypeScript型定義  | Field定義        | 通知ロジック
─────────────────────────────────────────────────────────────────────────────
1:30-    | レポート作成画面  | TDD: 作成API      | 連携テスト準備   | Report作成
4:30     | (写真+位置+説明) | TDD: バリデーション| Cloud Function   | Dashboard設計
─────────────────────────────────────────────────────────────────────────────
4:30-    | 一覧表示画面      | TDD: プッシュ通知  | Salesforce連携   | Dashboard実装
6:30     | リアルタイム更新  | FCM設定           | REST API呼出     | テストデータ
─────────────────────────────────────────────────────────────────────────────
6:30-    | PWA設定          | Cloud Functions   | 統合テスト       | デモ準備
8:00     | オフライン対応    | デプロイ          | バグ修正         | プレゼン資料
─────────────────────────────────────────────────────────────────────────────
8:00-    | 統合テスト        | 統合テスト        | 統合テスト       | プレゼン練習
10:00    | UI仕上げ         | 最終デプロイ       | 最終確認         | デモシナリオ
```

## 10.2 短縮スケジュール（8時間）

| 時間 | 内容 | 成果物 |
|------|------|--------|
| 0:00-0:30 | チームブレスト、アイデア確定 | 最終アイデア |
| 0:30-1:00 | 画面スケッチ、優先順位 | ワイヤーフレーム |
| 1:00-2:00 | プロジェクトセットアップ | Firebase + Frontend |
| 2:00-5:00 | コア機能開発 | 動くプロトタイプ |
| 5:00-6:00 | UI磨き込み | ビジュアル完成 |
| 6:00-7:00 | デモ準備、テスト | デモ動作確認 |
| 7:00-8:00 | プレゼン作成 | スライド完成 |

---

# 11. プレゼンテーションガイド

## 11.1 5分構成

```
1. 課題提起（1分）
   - 現状：遅い、信頼できない、紙ベース
   - 「なぜこれが必要か？」

2. ソリューション紹介（1分）
   - 作ったもの
   - 主要機能3つ

3. デモ（2分）
   - ライブデモ
   - ユースケースシナリオ

4. 期待効果（0.5分）
   - 定量的数値
   - 「XX時間削減」「XX%改善」

5. 今後の展望（0.5分）
   - 拡張可能性
   - 全社展開イメージ
```

## 11.2 デモシナリオ

```
1. [0:00-0:30] 課題設定
   「店舗で設備故障が発生。現在の報告方法は？」
   → 電話、メール、紙... → 漏れる、遅い、追跡できない

2. [0:30-1:00] ソリューション紹介
   「インシデントレポートPWAで解決」
   → 写真＋GPS＋即時通知

3. [1:00-3:00] ライブデモ
   ① スマホでアプリ起動（PWA：インストール不要）
   ② 写真撮影 → タイプ選択 → 説明入力
   ③ 送信 → 担当者にプッシュ通知
   ④ Salesforceダッシュボードでリアルタイム表示

4. [3:00-4:00] 技術的こだわり
   「Kent Beck TDDで品質確保」
   「循環的複雑度≤10、認知的複雑度≤15」
   → 保守しやすい、バグが少ない

5. [4:00-5:00] インパクト
   「年間55,000時間削減 = 約8,300万円/年」
   「法的コンプライアンスも確保」
```

## 11.3 バックアッププラン

デモ失敗時：
1. 事前録画した動画バックアップ
2. スクリーンショットウォークスルー
3. アーキテクチャ図説明

---

# 12. 技術セットアップ

## 12.1 事前準備チェックリスト

- [ ] Firebaseプロジェクト作成
- [ ] Firebase CLI インストール
- [ ] Node.js / npm 環境確認
- [ ] React (Vite) または Ionic テンプレート準備
- [ ] GitHub リポジトリ作成
- [ ] 全メンバーの開発環境確認
- [ ] Salesforce Org アクセス確認
- [ ] Connected App 権限確認

## 12.2 ESLint + SonarJS セットアップ

```bash
# 依存関係インストール
npm install --save-dev eslint eslint-plugin-sonarjs

# .eslintrc.js 作成
```

```javascript
// .eslintrc.js
module.exports = {
  extends: ['plugin:sonarjs/recommended'],
  plugins: ['sonarjs'],
  rules: {
    'complexity': ['error', { max: 10 }],
    'sonarjs/cognitive-complexity': ['error', 15],
    'max-depth': ['error', 3],
    'max-lines-per-function': ['error', 50],
  }
};
```

## 12.3 JSforce + JWT認証

```typescript
import jsforce from 'jsforce';
import jwt from 'jsonwebtoken';

async function getSalesforceConnection() {
  const privateKey = process.env.SF_PRIVATE_KEY;
  const clientId = process.env.SF_CONSUMER_KEY;
  const username = process.env.SF_USERNAME;
  
  const token = jwt.sign({
    iss: clientId,
    sub: username,
    aud: 'https://login.salesforce.com',
    exp: Math.floor(Date.now() / 1000) + 300,
  }, privateKey, { algorithm: 'RS256' });
  
  const response = await fetch('https://login.salesforce.com/services/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token,
    }),
  });
  
  const { access_token, instance_url } = await response.json();
  
  return new jsforce.Connection({
    instanceUrl: instance_url,
    accessToken: access_token,
  });
}
```

## 12.4 プロジェクト構造

```
incident-report-pwa/
├── frontend/                    # React PWA
│   ├── src/
│   │   ├── components/
│   │   │   ├── IncidentForm.tsx
│   │   │   ├── IncidentList.tsx
│   │   │   └── CameraCapture.tsx
│   │   ├── hooks/
│   │   │   ├── useIncidents.ts
│   │   │   └── useGeolocation.ts
│   │   ├── services/
│   │   │   └── incidentService.ts
│   │   └── __tests__/
│   └── vite.config.ts
│
├── functions/                   # Cloud Functions
│   ├── src/
│   │   ├── incidents/
│   │   │   ├── create.ts
│   │   │   └── __tests__/
│   │   ├── salesforce/
│   │   │   ├── client.ts
│   │   │   └── sync.ts
│   │   └── notifications/
│   │       └── send.ts
│   └── jest.config.js
│
├── salesforce/                  # Salesforce metadata
│   ├── objects/
│   │   └── Incident__c/
│   ├── flows/
│   └── reports/
│
└── docs/
    └── api-spec.md
```

---

# 13. AI調査プロンプト集

## 13.1 競合店舗運営調査

```
You are a retail technology analyst. Research:

**Topic**: Store operations management systems

**Questions**:
1. Digital checklists used by Walmart, Target, Home Depot
2. Incident reporting systems in retail
3. Key success features

**Output**: Company, System, Features, Complexity, Sources
```

## 13.2 Firebase + Salesforce連携

```
You are a cloud integration architect. Research:

**Topic**: Firebase + Salesforce integration best practices

**Questions**:
1. JWT Bearer Flow authentication
2. Real-time vs batch sync patterns
3. Rate limiting, error handling pitfalls
4. Existing npm packages

**Constraints**: CC≤10, CoC≤15
```

## 13.3 Kent Beck TDD for PWA

```
You are a software craftsmanship expert. Research:

**Topic**: TDD for PWA development

**Questions**:
1. Red-Green-Refactor for React components
2. Testing tools (Vitest vs Jest)
3. Low complexity maintenance with TDD
4. Kent Beck's latest TDD thoughts (2024-2025)
```

## 13.4 PWAオフライン実装

```
You are a PWA expert. Research:

**Topic**: Offline-first PWA for incident reporting

**Questions**:
1. IndexedDB, Service Worker strategies
2. Offline photo capture and upload
3. GPS caching
4. Online sync and conflict resolution
```

## 13.5 Salesforceデータモデルレビュー

```
You are a Salesforce architect. Review:

**Object**: Incident__c
**Fields**: [セクション8.3参照]

**Questions**:
1. Data model quality?
2. Missing fields?
3. Geolocation compound vs separate lat/lng?
4. Indexes and validation rules?
5. Automation suggestions?
```

---

# クイックリファレンス

## 成功基準チェックリスト

### 技術品質
- [ ] 全関数：循環的複雑度 ≤ 10
- [ ] 全関数：認知的複雑度 ≤ 15
- [ ] テストカバレッジ ≥ 80%（ビジネスロジック）
- [ ] TDDサイクル遵守

### 機能完成度
- [ ] インシデント登録が動作する
- [ ] プッシュ通知が送信される
- [ ] Salesforceにデータ同期される
- [ ] Salesforceレポートでデータ表示

### デモ準備
- [ ] 5分デモシナリオ完成
- [ ] デモデータ投入済み
- [ ] プレゼンスライド完成
- [ ] バックアッププラン準備

---

## 主要URL

| リソース | URL |
|---------|-----|
| Firebase Docs | https://firebase.google.com/docs |
| React + Vite | https://vitejs.dev/guide/ |
| Ionic Framework | https://ionicframework.com/docs |
| PWA Checklist | https://web.dev/pwa-checklist/ |
| JSforce Docs | https://jsforce.github.io/document/ |
| ESLint Complexity | https://eslint.org/docs/latest/rules/complexity |
| SonarJS Plugin | https://github.com/SonarSource/eslint-plugin-sonarjs |

---

**作成日**: 2026年2月5日  
**チーム**: 4名（フロントエンド1、バックエンド1、Salesforce2）  
**目標完了時間**: 10時間
