<!-- omit in toc -->
# GAS-Steam-Notion-Register

<!-- omit in toc -->
## 概要
Googleスプレッドシート経由で、SteamのゲームページURLからNotionへゲーム情報を登録する。

## 必要なもの
> - Googleアカウント
> - Notionアカウント

## 目次
- [初期設定](#初期設定)
  - [1. Google スプレッドシートの準備](#1-google-スプレッドシートの準備)
    - [スプレッドシートの作成と初期設定](#スプレッドシートの作成と初期設定)
    - [登録用ボタンの作成](#登録用ボタンの作成)
    - [拡張機能（スクリプト）の設定](#拡張機能スクリプトの設定)
  - [2. Notionの準備](#2-notionの準備)
    - [登録用ページの作成](#登録用ページの作成)
    - [連携トークンの生成とスプレッドシートへの設定](#連携トークンの生成とスプレッドシートへの設定)
    - [登録用ページへの設定](#登録用ページへの設定)
    - [拡張機能への権限の付与](#拡張機能への権限の付与)
- [利用方法](#利用方法)

## 初期設定
### 1. Google スプレッドシートの準備
#### スプレッドシートの作成と初期設定
1. Googleドライブ内、任意の場所で新たにスプレッドシートを作成
	![](img/Pasted%20image%2020220901032200.png)
1. 任意の名称を指定  
	![](img/Pasted%20image%2020220901032337.png)
1. 以下のようにセルを設定（２行目に何が入るか、のメモなので、入れなくても問題ありません。）

|     | A   | B             | C           |
|:---:| --- | ------------- | ----------- |
|  1  | URL | Notion_Secret | Database_ID | 
|  2  |     |               |             |

#### 登録用ボタンの作成
1. リボンバー内「挿入」から「図形描画」を選択  
	![](img/Pasted%20image%2020220901032810.png)

1. 「図形」メニューから、適当な図形を選択  
	![](img/Pasted%20image%2020220901032935.png)

1. 図形を作成し、「登録」など、自分でわかるように文字を記載、「保存して終了」を選択  
	![](img/Pasted%20image%2020220901033228.png)

1. 適当な場所に移動させたあと、三点リーダーをクリックしてから「スクリプトを割り当て」を選択  
	![](img/Pasted%20image%2020220901033345.png)

1. 表示されたダイアログにて、`myFunction` を指定後「確定」を選択  
	![](img/Pasted%20image%2020220901033440.png)

#### 拡張機能（スクリプト）の設定
1. リボンバー内「拡張機能」から「Apps Script」を選択  
	![](img/Pasted%20image%2020220901033549.png)

1. コードエディタが開くので、[code.gs](code.gs) の内容で上書き  
	![](img/Pasted%20image%2020220901033757.png)

1. Parser（Steamのストアページの内容を抽出するために必要なライブラリ）を登録するため、サイドバー内「ライブラリ」右の「＋」アイコンをクリック  
	![](img/Pasted%20image%2020220901034035.png)

1. ダイアログの「スクリプトID」に `1Mc8BthYthXx6CoIz90-JiSzSafVnT6U3t0z_W3hLTAX5ek4w0G_EIrNw` を指定後、「検索」を選択（code.gs の1行目角括弧の中にもあります）  
	![](img/Pasted%20image%2020220901034251.png)

1. 「ID」が**Parser**になっていることを確認し、「追加」を選択
2. 「プロジェクトを保存」アイコンをクリックし、プロジェクトを保存  
	![](img/Pasted%20image%2020220901034404.png)

### 2. Notionの準備
#### 登録用ページの作成
※ [サンプルページ](https://www.notion.so/ffbd046230cf4a59a2a4a8bd2a0899f9?v=6fb9f3b34f7d41f0a2b4f26622198b98) の画面右上から「複製」してもOKです。
1. 任意の名称のページを新規作成  
	![](img/Pasted%20image%2020220901030714.png)
1. 「データベース」から「テーブル」を選択  
	![](img/Pasted%20image%2020220901030923.png)
1. 「データソースを選択する」では「新規データベース」を選択  
	![](img/Pasted%20image%2020220901031014.png)
1. 以下のようにプロパティを指定  

| プロパティ種類 | プロパティ名     | 備考                                                                         |
| -------------- | ---------------- | ---------------------------------------------------------------------------- |
| タイトル       | 名前             |                                                                              |
| マルチセレクト | ジャンル         |                                                                              |
| 日付           | リリース日       |                                                                              |
| テキスト       | リリース日(特殊) |                                                                              |
| マルチセレクト | 開発元           |                                                                              |
| マルチセレクト | 発売元           |                                                                              |
| URL            | Steam URL  |                                                                              |
| 関数           | 発売状況         | 関数には「編集」から`largerEq(now(), prop("リリース日")) ? "発売済み" : "未発売"` を入力 |
| セレクト       | 言語対応         |                                                                              |

1. 「テーブルビュー」右の「＋」アイコンを選択後、「ギャラリー」を選択、以下のように設定し、「完了」を選択
> - カードプレビュー：ページカバー画像
> - カードサイズ：小
> - 画像を表示枠のサイズに合わせる：オン
> - ページの開き方：ポップアップ

![](img/Pasted%20image%2020220901042814.png)

#### 連携トークンの生成とスプレッドシートへの設定
1. サイドバーから「設定」を選択  
	![](img/Pasted%20image%2020220901031908.png)
	
1. 「ワークスペース」内「インテグレーション」を選択後、「独自のインテグレーションを開発する」を選択  
	![](img/Pasted%20image%2020220901034559.png)

1. 「私のインテグレーション」画面に遷移するので、「新しいインテグレーションを作成する」を選択  
	![](img/Pasted%20image%2020220901034647.png)

1. 「基本情報」内、「名前」に任意の名称、「ユーザー機能」を「ユーザー情報なし」に設定し、「送信」をクリック  
	![](img/Pasted%20image%2020220901034942.png)

1. シークレット（トークン）が生成されるので、「表示」を選択後、「コピー」をクリック。（**このトークンを利用することでページを操作できるので、トークンは原則、公開しないでください。**）  
	![](img/Pasted%20image%2020220901035254.png)

1. 作成したスプレッドシートのセル「B2」に、コピーしたトークンを貼り付ける  
	![](img/Pasted%20image%2020220901035440.png)

#### 登録用ページへの設定
1. 登録用ページの「共有」を選択後、「メール、ユーザー、インテグレーションを追加」を選択  
	![](img/Pasted%20image%2020220901035726.png)

1. 「インテグレーションの招待」から先程作成したインテグレーションを選択後、「招待」を選択  
	![](img/Pasted%20image%2020220901035827.png)

1. インテグレーションに編集権限が付与されていることを確認後、「リンクをコピー」を選択  
	![](img/Pasted%20image%2020220901040038.png)

1. コピーしたURLのうち、`https://www.notion.so/` と `?v=` の間の文字列（`https://www.notion.so/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX?v=YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY` であれば `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` の部分）を、スプレッドシートのセル「C2」に貼り付ける  
	![](img/Pasted%20image%2020220901040609.png)

#### 拡張機能への権限の付与
1. スプレッドシートの登録用ボタンをクリックし、しばらく待つ
2. 「承認が必要」ダイアログが表示されるので「続行」を選択  
	![](img/Pasted%20image%2020220901040821.png)
3. 自身のアカウントを選択後、「このアプリはGoogleで確認されていません」画面が表示されるので、「詳細を表示」から「無題のプロジェクト{プロジェクト名}（安全ではないページ）に移動」を選択  
	![](img/Pasted%20image%2020220901041125.png)
4. 「アクセスをリクエスト」画面に遷移するので「許可」を選択、なお、各権限は以下の理由で利用されます。
> - Googleドライブのすべてのファイルの表示、編集、作成、削除：スプレッドシートへのアクセス
> - Googleスプレッドシートのすべてのスプレッドシートの参照、編集、作成、削除：スプレッドシートからの情報（URL、トークンなど）の読み取り
> - 外部サービスへの接続：Steam, Notionへの通信

![](img/Pasted%20image%2020220901041904.png)

## 利用方法
1. スプレッドシートのA列に、NotionへインポートしたいゲームのSteamURLを記載  
	![](img/Pasted%20image%2020220901042848.png)

2. 登録用ボタンをクリックするとスクリプトが動作、年齢確認のあるゲームについては情報が取得出来ないため、ダイアログに表示されたURLをコピーし、手動で登録する必要があります。  
	![](img/Pasted%20image%2020220901043942.png)

3. Notionの登録用ページを確認すると、情報が登録できているはずです。  
	![](img/Pasted%20image%2020220901044038.png)
