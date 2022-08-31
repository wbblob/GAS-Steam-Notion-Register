// ParserID [1Mc8BthYthXx6CoIz90-JiSzSafVnT6U3t0z_W3hLTAX5ek4w0G_EIrNw]
const ss = SpreadsheetApp.getActiveSheet();
const NOTION_SECRET = ss.getRange(2,2).getValue()
const NOTION_VERSION = '2022-06-28'
const DATABASE_ID = ss.getRange(2, 3).getValue()

function myFunction() {
  // 記載されたURLの取得
  let urlrange = ss.getRange(2, 1, ss.getLastRow() - 1)
  let urls = urlrange.getValues();
  urls = urls.map(url => url[0])

  // URLからアプリケーションIDの取得
  let appids = urls.map(url => url2Appid(url))

  // 年齢確認に引っかかったリストの用意
  var nsfw_s = []

  // 取得したURLに対してそれぞれ登録処理
  urls.forEach(url => {
    // アプリケーションIDの取得
    if (url != '' | null){
      let id = url2Appid(url)
      let pageid = registergame(id);
      // 年齢確認に引っかかったか確認
      if (pageid == null) {
        Logger.log('muri')
        nsfw_s.push(url)
      }
    }
  })

  let result = "完了しました！"
  let error = ''
  if (nsfw_s.length > 0) {
    error = `\\nただし、以下のものについては、年齢確認に引っかかってしまったので、手動で登録してください…\\n以下のリストをコピーしてから「OK」をクリックしてください。${nsfw_s.join(',\\n')}`
  }

  Browser.msgBox(result + error)
  
  // 記載されたURLの消去（初期化）
  urlrange.setValue('')
}

// 登録処理
function registergame(gameid) {
  let gamedata = getgamepage(gameid)

  if (gamedata != null){
    var pageid = createGamePage(gamedata).id
  } else {
    var pageid = null
  }
  return pageid
}

function url2Appid(url){
  let appid = url.split('/')[4]
  return appid
}

function getgamepage(gameid){
  let url = `https://store.steampowered.com/app/${gameid}`
  let options = {
  headers : {
    'Cookie' : 'Steam_Language=japanese;'
    }
  }

  // get response & content
  let response = UrlFetchApp.fetch(url, options)
  let content = response.getContentText()

  // 年齢確認チェック
  if (content.includes('誕生日を入力して次に進んでください')) {
    return null
  }
  
  // get params
    // タイトルの収集
  let title = Parser.data(content).from('class="apphub_AppName">').to('</div>').iterate()[0];
    // カバー画像URLの収集
  let coverurl = Parser.data(content).from('<img class="game_header_image_full" src="').to('">').iterate()[0];
    //　リリース日の収集
  let release_date = Parser.data(content).from('<div class="date">').to('</div>').iterate()[0];
  let release_date_text = ''
      // リリース日の変換
  try {
    release_date = release_date.replace(/年|月/g, '/').replace('日', '');
    release_date = new Date(release_date).toISOString().slice(0, 10)
  } catch(e){
    release_date_text = release_date
    release_date = null
  }

  // 開発者とパブリッシャの取得
  let developpers = Parser.data(Parser.data(content).from('<div class="summary column" id="developers_list">').to('</div>').iterate()[0]).from('">').to('</a>').iterate();
  let publishers = Parser.data(Parser.data(content).from('<div class="subtitle column">パブリッシャー:</div>').to('</div>').iterate()[0]).from('<a href="').to('a>').iterate().map(record => Parser.data(record).from('">').to('</').iterate()[0])

  // ゲーム紹介文の取得
  let description = Parser.data(content).from('<div class="game_description_snippet">').to('</div>').iterate()[0].trim()

  // 日本語対応状況の取得
  let localization_table = Parser.data(content).from('"game_language_options"').to('</table>').iterate()[0]
  let localization = Parser.data(localization_table).from('日本語').to('</tr>').iterate()[0]
  let japanese_localization = !localization.includes('サポートされていません')

  // タグtop3の取得
  let tags = Parser.data(content).from('class="glance_tags popular_tags" data-appid="').to('app_tag add_button').iterate()[0];
  tags = Parser.data(tags).from('class="app_tag"').to('/a>').iterate().map(line => Parser.data(line).from('">').to('<').iterate()[0].trim())

  // データの組み立てと返却
  let gamedatas = {
    "title": title, 
    "coverurl": coverurl, 
    "release_date": release_date, 
    "release_date_text": release_date_text,
    "developpers": developpers, 
    "publishers": publishers, 
    "description": description, 
    "url": url, 
    "japanese_localization": japanese_localization,
    "tags": tags.slice(0,3),
    }

  return gamedatas
}

// ref: https://dev.classmethod.jp/articles/get-database-by-notion-api-with-gas/

// ページ作成リクエストの送信処理
function createPage(data) {
  data = JSON.stringify(data)
  return sendRequest("https://api.notion.com/v1/pages", "post", data)
}

// リクエストの送信処理
function sendRequest(url, method, data=null) {
  let headers = {
    'content-type' : 'application/json; charset=UTF-8',
    'Authorization' : 'Bearer ' + NOTION_SECRET,
    'Notion-Version' : NOTION_VERSION,
  };
  let options = {
    'method' : method,
    'headers' : headers,
    'payload' : data,
    'muteHttpExceptions' : false,
  };

  // get response
  let notion_data = UrlFetchApp.fetch(url, options);
  // 通信頻度制限回避用のSleep
  Utilities.sleep(500)
  notion_data = JSON.parse(notion_data)
  return notion_data
}

// ゲームページ用のデータ準備
function createGamePage(gamedata){
  let data = {
    "parent": { "database_id": DATABASE_ID },
    "cover": {
      "external": {
        "url": gamedata.coverurl
      }
    },
    "properties": {
      "title": {
        "title": [
          {
            "text": {
              "content": gamedata.title
            }
          }
        ]
      },
      "ジャンル": {
        "multi_select" : 
          gamedata.tags.map(tag => ({"name":unescapeHtml(tag)})),
      },
      "開発元": {
        "multi_select" : 
          gamedata.developpers.map(developper => ({"name":unescapeHtml(developper).replace(',', ' ')})),
      },
      "発売元": {
        "multi_select" : 
          gamedata.publishers.map(publisher => ({"name":unescapeHtml(publisher).replace(',', ' ')})),
      },
      "Steam URL":{
        "url": 
          gamedata.url
      }
    },
    "children": [
      {
        "object": "block",
        "type": "heading_2",
        "heading_2": {
          "rich_text": [{ "type": "text", "text": { "content": "Steamのゲーム紹介文" } }]
        }
      },
      {
        "object": "block",
        "type": "quote",
        "quote": {
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": unescapeHtml(gamedata.description)
              }
            }
          ]
        }
      },
    ]
  }

  // リリース日の処理
  if (gamedata.release_date != null) {
    data['properties']['リリース日'] = {"date": {"start": gamedata.release_date}}
  } else {
    data['properties']['リリース日(特殊)'] = {"rich_text": [{"type": "text", "text": {"content": gamedata.release_date_text}}]}
  }

  // 日本語対応の追加処理
  if (gamedata.japanese_localization) {
    data['properties']['ジャンル']['multi_select'].push({"name":"日本語対応"})
    data['properties']['言語対応'] = {'select':{"name":"日本語対応"}}
  } else {
    data['properties']['言語対応'] = {'select':{"name":"日本語非対応"}}
  }

  return createPage(data)  
}

function unescapeHtml(target) {
	if (typeof target !== 'string') return target;

	var patterns = {
		'&lt;'   : '<',
		'&gt;'   : '>',
		'&amp;'  : '&',
		'&quot;' : '"',
		'&#x27;' : '\'',
		'&#x60;' : '`'
	};

	return target.replace(/&(lt|gt|amp|quot|#x27|#x60);/g, function(match) {
		return patterns[match];
	});
}

/*
Copyright (c) 2022 wannabeblob
Released under the MIT license
https://github.com/wbblob/GAS-Steam-Notion-Register/blob/main/LICENSE
*/
