# issue-watcher

GitHub Issues を定期的にポーリングし、`claude-task` ラベルが付いた新規 Issue を
見つけると Claude Code (`claude` CLI) に headless で処理を依頼して、
ファイル変更・コミット・PR 作成まで自動で行う常駐スクリプトです。

## 動作の流れ

1. `TARGET_LABEL`（既定 `claude-task`）が付いた未処理の open issue をポーリング
2. `REPO_PATH` のクローンで `BASE_BRANCH` から新しいブランチ `issue-<番号>-<slug>` を作成
3. `claude -p "<issue本文>" --dangerously-skip-permissions` を実行し、
   Claude Code にファイル作成・編集をさせる（コミット/PR作成はさせない）
4. 変更があればコミット・push し、Issue を close する PR を作成
5. Issue にコメントし、ラベルを `TARGET_LABEL` → `DONE_LABEL`（既定 `claude-done`）に付け替え
6. 処理済み Issue 番号を `state.json` に保存（再起動しても再処理しない）

## セットアップ

```bash
cd bots/issue-watcher
npm install
cp .env.example .env
# .env を編集: GITHUB_TOKEN, REPO_PATH などを設定
npm start
```

- `REPO_PATH` は **専用のクローン**を指してください。このスクリプトは
  `git checkout -B` / `git reset --hard` を実行するため、手元で編集中の
  作業コピーを指定すると未保存の変更が失われます。
- `claude` CLI (Claude Code) がインストール済みで、`REPO_PATH` から実行可能なこと
  （PATH に通っていること）を確認してください。
- `GITHUB_TOKEN` は `repo` スコープ（issues・contents・pull_requests の read/write）
  を持つ Personal Access Token を使ってください。

## 安全上の注意

- `--dangerously-skip-permissions` を使っているため、Claude Code は
  無人でファイル編集や任意のシェルコマンドを実行できます。
  **信頼できる Issue 発行者のみ**が `claude-task` ラベルを付けられるように、
  リポジトリの権限設定（誰がラベルを付与できるか）を絞ってください。
- 想定外の変更が入らないよう、生成された PR は必ず人がレビューしてから
  マージしてください（このスクリプトは PR のマージは行いません）。
- 処理に失敗した Issue も `state.json` に記録され再試行されません。
  再試行したい場合は `DONE_LABEL`/`TARGET_LABEL` を付け替えるか、
  `state.json` から該当の Issue 番号を削除してください。

## 常駐運用

`npm start` はフォアグラウンドで動き続けるループです。本番運用では
pm2 / systemd / Windows サービスなどでプロセス管理してください。
