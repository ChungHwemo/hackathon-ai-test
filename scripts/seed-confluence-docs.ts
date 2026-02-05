import 'dotenv/config';

const ATLASSIAN_DOMAIN = process.env.VITE_ATLASSIAN_DOMAIN || process.env.ATLASSIAN_DOMAIN!;
const ATLASSIAN_EMAIL = process.env.VITE_ATLASSIAN_EMAIL || process.env.ATLASSIAN_EMAIL!;
const ATLASSIAN_API_TOKEN = process.env.VITE_ATLASSIAN_API_TOKEN || process.env.ATLASSIAN_API_TOKEN!;
const CONFLUENCE_SPACE_KEY = process.env.VITE_CONFLUENCE_SPACE_KEY || process.env.CONFLUENCE_SPACE_KEY || 'G2';

const authHeader = `Basic ${Buffer.from(`${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}`).toString('base64')}`;
const baseUrl = `https://${ATLASSIAN_DOMAIN}.atlassian.net/wiki`;

interface SpaceInfo {
  id: string;
  key: string;
  name: string;
}

async function getSpaceId(spaceKey: string): Promise<string> {
  const response = await fetch(`${baseUrl}/api/v2/spaces?keys=${spaceKey}`, {
    headers: {
      Authorization: authHeader,
      Accept: 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get space: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json() as { results: SpaceInfo[] };
  if (data.results.length === 0) {
    throw new Error(`Space ${spaceKey} not found`);
  }
  
  return data.results[0].id;
}

async function createPage(spaceId: string, title: string, body: string): Promise<void> {
  const response = await fetch(`${baseUrl}/api/v2/pages`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      spaceId,
      title,
      body: { representation: 'storage', value: body },
      status: 'current',
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    if (errorText.includes('title already exists')) {
      console.log(`  ⚠️  Page already exists: ${title}`);
      return;
    }
    throw new Error(`Failed to create page "${title}": ${response.status} - ${errorText}`);
  }
  
  console.log(`  ✅ Created: ${title}`);
}

const testDocuments = [
  {
    title: '[Auth] ログイン機能 技術仕様書',
    body: `
<h1>ログイン機能 技術仕様書</h1>

<h2>概要</h2>
<p>本ドキュメントは認証システムのログイン機能について記載します。</p>

<h2>認証フロー</h2>
<ol>
  <li>ユーザーがログインボタンをクリック</li>
  <li>認証APIにPOSTリクエスト送信</li>
  <li>JWTトークン発行</li>
  <li>セッションストレージに保存</li>
</ol>

<h2>エンドポイント</h2>
<p><code>POST /api/v1/auth/login</code></p>

<h2>エラーハンドリング</h2>
<ul>
  <li>401: 認証失敗</li>
  <li>429: レート制限</li>
  <li>500: サーバーエラー</li>
</ul>

<h2>既知の問題</h2>
<p>ログインボタンが反応しない場合、以下を確認してください：</p>
<ul>
  <li>JavaScriptエラーがないか確認</li>
  <li>APIエンドポイントが正しいか確認</li>
  <li>CORSの設定を確認</li>
</ul>
`,
  },
  {
    title: '[Auth] パスワードリセット機能 仕様書',
    body: `
<h1>パスワードリセット機能 仕様書</h1>

<h2>概要</h2>
<p>ユーザーがパスワードを忘れた場合のリセット機能について説明します。</p>

<h2>リセットフロー</h2>
<ol>
  <li>「パスワードを忘れた」リンクをクリック</li>
  <li>メールアドレスを入力</li>
  <li>リセットリンクがメールで送信される</li>
  <li>リンクをクリックして新しいパスワードを設定</li>
</ol>

<h2>エンドポイント</h2>
<ul>
  <li><code>POST /api/v1/auth/forgot-password</code></li>
  <li><code>POST /api/v1/auth/reset-password</code></li>
</ul>

<h2>トラブルシューティング</h2>
<p>パスワードリセットが動作しない場合：</p>
<ul>
  <li>メール送信サービス(SendGrid)のステータスを確認</li>
  <li>リセットトークンの有効期限(24時間)を確認</li>
  <li>スパムフォルダを確認するようユーザーに案内</li>
</ul>
`,
  },
  {
    title: '[QA] MagicPod テスト自動化ガイド',
    body: `
<h1>MagicPod テスト自動化ガイド</h1>

<h2>概要</h2>
<p>MagicPodを使用したE2Eテスト自動化の手順を説明します。</p>

<h2>環境設定</h2>
<ul>
  <li>MagicPod Cloud アカウント</li>
  <li>プロジェクト: Project-K-E2E</li>
  <li>実行環境: Chrome (Headless)</li>
</ul>

<h2>テストケース一覧</h2>
<table>
  <tr><th>ID</th><th>テスト名</th><th>優先度</th></tr>
  <tr><td>TC-001</td><td>ログイン成功</td><td>高</td></tr>
  <tr><td>TC-002</td><td>ログイン失敗（無効なパスワード）</td><td>高</td></tr>
  <tr><td>TC-003</td><td>パスワードリセット</td><td>中</td></tr>
  <tr><td>TC-004</td><td>セッションタイムアウト</td><td>中</td></tr>
</table>

<h2>CI/CD統合</h2>
<p>GitHub Actionsでの実行コマンド:</p>
<pre>npx magicpod-cli run --project Project-K-E2E --test-plan Regression</pre>
`,
  },
  {
    title: '[Troubleshooting] 認証エラー対応マニュアル',
    body: `
<h1>認証エラー対応マニュアル</h1>

<h2>よくあるエラーと解決方法</h2>

<h3>1. ログインボタンが反応しない</h3>
<p><strong>原因:</strong> フロントエンドのイベントハンドラーが正しくバインドされていない</p>
<p><strong>解決方法:</strong></p>
<ul>
  <li>ブラウザの開発者ツールでJavaScriptエラーを確認</li>
  <li>React DevToolsでコンポーネントの状態を確認</li>
  <li>ネットワークタブでAPIリクエストが送信されているか確認</li>
</ul>

<h3>2. 「Invalid credentials」エラー</h3>
<p><strong>原因:</strong> メールアドレスまたはパスワードが間違っている</p>
<p><strong>解決方法:</strong></p>
<ul>
  <li>Caps Lockがオンになっていないか確認</li>
  <li>パスワードリセットを案内</li>
</ul>

<h3>3. パスワードリセットメールが届かない</h3>
<p><strong>原因:</strong> メール送信サービスの問題、またはスパムフィルター</p>
<p><strong>解決方法:</strong></p>
<ul>
  <li>SendGridダッシュボードでメール送信ログを確認</li>
  <li>迷惑メールフォルダを確認するよう案内</li>
  <li>別のメールアドレスで試す</li>
</ul>
`,
  },
  {
    title: '[API] 認証API リファレンス',
    body: `
<h1>認証API リファレンス</h1>

<h2>Base URL</h2>
<p><code>https://api.Project-K.example.com/v1</code></p>

<h2>エンドポイント</h2>

<h3>POST /auth/login</h3>
<p>ユーザー認証を行いJWTトークンを発行します。</p>
<p><strong>Request Body:</strong></p>
<pre>
{
  "email": "user@example.com",
  "password": "password123"
}
</pre>
<p><strong>Response (200):</strong></p>
<pre>
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
</pre>

<h3>POST /auth/forgot-password</h3>
<p>パスワードリセットメールを送信します。</p>

<h3>POST /auth/reset-password</h3>
<p>新しいパスワードを設定します。</p>

<h2>エラーコード</h2>
<table>
  <tr><th>Code</th><th>Message</th><th>Description</th></tr>
  <tr><td>AUTH001</td><td>Invalid credentials</td><td>メールまたはパスワードが無効</td></tr>
  <tr><td>AUTH002</td><td>Account locked</td><td>アカウントがロックされている</td></tr>
  <tr><td>AUTH003</td><td>Token expired</td><td>トークンの有効期限切れ</td></tr>
</table>
`,
  },
  {
    title: '[DevOps] 本番環境デプロイ手順',
    body: `
<h1>本番環境デプロイ手順</h1>

<h2>前提条件</h2>
<ul>
  <li>mainブランチにマージ済み</li>
  <li>全てのテストがパス</li>
  <li>PRレビュー承認済み</li>
</ul>

<h2>デプロイ手順</h2>
<ol>
  <li>GitHub Actionsの「Production Deploy」ワークフローを手動実行</li>
  <li>Slackの #deploy-notifications チャンネルで進捗を確認</li>
  <li>デプロイ完了後、ヘルスチェックを確認</li>
  <li>Datadogダッシュボードでエラー率を監視</li>
</ol>

<h2>ロールバック手順</h2>
<p>問題発生時は以下のコマンドで前バージョンに戻す:</p>
<pre>
kubectl rollout undo deployment/Project-K-api -n production
</pre>

<h2>関連リンク</h2>
<ul>
  <li>Datadog Dashboard: https://app.datadoghq.com/dashboard/xxx</li>
  <li>ArgoCD: https://argocd.Project-K.example.com</li>
</ul>
`,
  },
];

async function main() {
  console.log('🚀 Confluence テストドキュメント作成開始\n');
  console.log(`📍 Space: ${CONFLUENCE_SPACE_KEY}`);
  console.log(`🌐 Domain: ${ATLASSIAN_DOMAIN}\n`);
  
  try {
    const spaceId = await getSpaceId(CONFLUENCE_SPACE_KEY);
    console.log(`✅ Space ID: ${spaceId}\n`);
    
    console.log('📝 ドキュメント作成中...\n');
    
    for (const doc of testDocuments) {
      try {
        await createPage(spaceId, doc.title, doc.body);
      } catch (error) {
        console.error(`  ❌ Error: ${doc.title}`, error);
      }
    }
    
    console.log('\n✨ 完了!');
    
  } catch (error) {
    console.error('❌ エラー:', error);
    process.exit(1);
  }
}

main();
