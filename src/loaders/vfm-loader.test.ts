import { describe, it, expect } from 'vitest';
import { rewriteRelativeLinks, cleanJaeuSpacesInHtml } from './vfm-loader';

describe('rewriteRelativeLinks', () => {
  describe('同一ディレクトリの兄弟参照（unified: .md 有無を問わない）', () => {
    describe('非 index ページ由来 → ../X/', () => {
      it('./foo.md → ../foo/', () => {
        const html = '<a href="./foo.md">foo</a>';
        expect(rewriteRelativeLinks(html, { lang: 'en' }))
          .toBe('<a href="../foo/">foo</a>');
      });

      it('./foo.md#bar → ../foo/#bar（バグ修正対象）', () => {
        const html = '<a href="./foo.md#bar">foo</a>';
        expect(rewriteRelativeLinks(html, { lang: 'en' }))
          .toBe('<a href="../foo/#bar">foo</a>');
      });

      it('./foo（拡張子なし）→ ../foo/', () => {
        const html = '<a href="./foo">foo</a>';
        expect(rewriteRelativeLinks(html, { lang: 'en' }))
          .toBe('<a href="../foo/">foo</a>');
      });

      it('./foo#bar（拡張子なし＋fragment）→ ../foo/#bar', () => {
        const html = '<a href="./foo#bar">foo</a>';
        expect(rewriteRelativeLinks(html, { lang: 'en' }))
          .toBe('<a href="../foo/#bar">foo</a>');
      });

      it('パーセントエンコード済の日本語フラグメントも保持される', () => {
        const html = '<a href="./themes-and-css.md#%E3%83%9A%E3%83%BC%E3%82%B8%E3%82%B5%E3%82%A4%E3%82%BA%E3%81%AE%E6%8C%87%E5%AE%9A">x</a>';
        expect(rewriteRelativeLinks(html, { lang: 'ja' }))
          .toBe('<a href="../themes-and-css/#%E3%83%9A%E3%83%BC%E3%82%B8%E3%82%B5%E3%82%A4%E3%82%BA%E3%81%AE%E6%8C%87%E5%AE%9A">x</a>');
      });
    });

    describe('index ページ由来 → ./X/', () => {
      it('./foo.md → ./foo/', () => {
        const html = '<a href="./foo.md">foo</a>';
        expect(rewriteRelativeLinks(html, { lang: 'en', isIndexPage: true }))
          .toBe('<a href="./foo/">foo</a>');
      });

      it('./foo.md#bar → ./foo/#bar', () => {
        const html = '<a href="./foo.md#bar">foo</a>';
        expect(rewriteRelativeLinks(html, { lang: 'en', isIndexPage: true }))
          .toBe('<a href="./foo/#bar">foo</a>');
      });
    });
  });

  describe('親ディレクトリの .md（既存挙動）', () => {
    it('en: ../foo.md → ../foo/', () => {
      const html = '<a href="../foo.md">x</a>';
      expect(rewriteRelativeLinks(html, { lang: 'en' }))
        .toBe('<a href="../foo/">x</a>');
    });

    it('en: ../foo.md#bar → ../foo/#bar', () => {
      const html = '<a href="../foo.md#bar">x</a>';
      expect(rewriteRelativeLinks(html, { lang: 'en' }))
        .toBe('<a href="../foo/#bar">x</a>');
    });

    it('ja: ../config.md → /ja/cli/config/', () => {
      const html = '<a href="../config.md">x</a>';
      expect(rewriteRelativeLinks(html, { lang: 'ja' }))
        .toBe('<a href="/ja/cli/config/">x</a>');
    });

    it('ja: ../config.md#section → /ja/cli/config/#section', () => {
      const html = '<a href="../config.md#section">x</a>';
      expect(rewriteRelativeLinks(html, { lang: 'ja' }))
        .toBe('<a href="/ja/cli/config/#section">x</a>');
    });
  });

  describe('クロスプロダクト viewer/reference', () => {
    it('viewer 配下から ./api.md → /en/reference/api/', () => {
      const html = '<a href="./api.md">x</a>';
      expect(rewriteRelativeLinks(html, {
        lang: 'en',
        collectionName: 'vivliostyle-viewer-en',
      })).toBe('<a href="/en/reference/api/">x</a>');
    });

    it('viewer 配下から ./api.md#section → /en/reference/api/#section', () => {
      const html = '<a href="./api.md#section">x</a>';
      expect(rewriteRelativeLinks(html, {
        lang: 'en',
        collectionName: 'vivliostyle-viewer-en',
      })).toBe('<a href="/en/reference/api/#section">x</a>');
    });

    it('reference 配下から ./vivliostyle-viewer.md → /ja/viewer/vivliostyle-viewer/', () => {
      const html = '<a href="./vivliostyle-viewer.md">x</a>';
      expect(rewriteRelativeLinks(html, {
        lang: 'ja',
        collectionName: 'vivliostyle-reference-ja',
      })).toBe('<a href="/ja/viewer/vivliostyle-viewer/">x</a>');
    });

    it('reference 配下から ./vivliostyle-viewer.md#anchor → /ja/viewer/vivliostyle-viewer/#anchor', () => {
      const html = '<a href="./vivliostyle-viewer.md#how-to-use">x</a>';
      expect(rewriteRelativeLinks(html, {
        lang: 'ja',
        collectionName: 'vivliostyle-reference-ja',
      })).toBe('<a href="/ja/viewer/vivliostyle-viewer/#how-to-use">x</a>');
    });
  });

  describe('themes-contributing 専用', () => {
    it('./docs/spec.md → /en/themes/spec/', () => {
      const html = '<a href="./docs/spec.md">x</a>';
      expect(rewriteRelativeLinks(html, {
        lang: 'en',
        collectionName: 'vivliostyle-themes-contributing-en',
      })).toBe('<a href="/en/themes/spec/">x</a>');
    });

    it('./docs/spec.md#section → /en/themes/spec/#section', () => {
      const html = '<a href="./docs/spec.md#section">x</a>';
      expect(rewriteRelativeLinks(html, {
        lang: 'en',
        collectionName: 'vivliostyle-themes-contributing-en',
      })).toBe('<a href="/en/themes/spec/#section">x</a>');
    });

    it('CODE_OF_CONDUCT.md（接頭辞無し）→ GitHub URL', () => {
      const html = '<a href="CODE_OF_CONDUCT.md">x</a>';
      expect(rewriteRelativeLinks(html, {
        lang: 'en',
        collectionName: 'vivliostyle-themes-contributing-en',
      })).toBe('<a href="https://github.com/vivliostyle/themes/blob/main/CODE_OF_CONDUCT.md">x</a>');
    });
  });

  describe('誤マッチ防止', () => {
    it('純粋なフラグメント #anchor は touch しない', () => {
      const html = '<a href="#anchor">x</a>';
      expect(rewriteRelativeLinks(html, { lang: 'en' }))
        .toBe('<a href="#anchor">x</a>');
    });

    it('外部 URL（github.com 等）は touch しない', () => {
      const html = '<a href="https://github.com/example/foo.md">x</a>';
      expect(rewriteRelativeLinks(html, { lang: 'en' }))
        .toBe('<a href="https://github.com/example/foo.md">x</a>');
    });

    it('画像 ./foo.png は touch しない（unified regex の文字クラスから . 除外）', () => {
      const html = '<a href="./foo.png">x</a>';
      expect(rewriteRelativeLinks(html, { lang: 'en' }))
        .toBe('<a href="./foo.png">x</a>');
    });

    it('画像 ./foo.svg は touch しない', () => {
      const html = '<a href="./foo.svg">x</a>';
      expect(rewriteRelativeLinks(html, { lang: 'en' }))
        .toBe('<a href="./foo.svg">x</a>');
    });

    it('既に / で終わっているリンクは touch しない（再書き換え防止）', () => {
      const html = '<a href="./foo/">x</a>';
      expect(rewriteRelativeLinks(html, { lang: 'en' }))
        .toBe('<a href="./foo/">x</a>');
    });
  });

  describe('言語スイッチャー li の除去（既存挙動）', () => {
    it('./ja/index.md を含む li は除去される', () => {
      const html = '<ul><li><a href="./ja/index.md">日本語</a></li><li>other</li></ul>';
      expect(rewriteRelativeLinks(html, { lang: 'en' }))
        .toBe('<ul><li>other</li></ul>');
    });
  });

  describe('Awesome Vivliostyle: CONTRIBUTING.md → GitHub URL', () => {
    it('CONTRIBUTING.md リンクが GitHub URL に書き換わる', () => {
      const html = '<a href="CONTRIBUTING.md">x</a>';
      expect(rewriteRelativeLinks(html, {
        lang: 'en',
        collectionName: 'vivliostyle-awesome-vivliostyle-en',
      })).toBe(
        '<a href="https://github.com/vivliostyle/awesome-vivliostyle/blob/master/CONTRIBUTING.md">x</a>'
      );
    });
  });
});

describe('cleanJaeuSpacesInHtml', () => {
  describe('prose 内の和欧境界スペース除去', () => {
    it('和文 + 半角スペース + ASCII を詰める', () => {
      expect(cleanJaeuSpacesInHtml('<p>これは Vivliostyle です</p>'))
        .toBe('<p>これはVivliostyleです</p>');
    });

    it('ASCII + 半角スペース + 和文 を詰める', () => {
      expect(cleanJaeuSpacesInHtml('<p>v2.40 で公開</p>'))
        .toBe('<p>v2.40で公開</p>');
    });

    it('連続する和欧スペース（fixed-point ループ）が全て詰まる', () => {
      // 「漢 ABC 字 ABC 漢」のように交互に並ぶケース
      expect(cleanJaeuSpacesInHtml('<p>漢 ABC 字 ABC 漢</p>'))
        .toBe('<p>漢ABC字ABC漢</p>');
    });

    it('和文同士のスペースは触らない（誤反応防止）', () => {
      expect(cleanJaeuSpacesInHtml('<p>これは 日本語</p>'))
        .toBe('<p>これは 日本語</p>');
    });

    it('ASCII 同士のスペースは触らない', () => {
      expect(cleanJaeuSpacesInHtml('<p>foo bar baz</p>'))
        .toBe('<p>foo bar baz</p>');
    });
  });

  describe('保護対象タグ（pre/code/style/script/kbd）の内側は不変', () => {
    it('<code> の中身は触らない（prose 側は通常通り詰める）', () => {
      // prose 側の "例え ABC" は和欧境界として詰められる。
      // code 側の "// 数値" は同じ ASCII+JA 境界だが、保護されて変化しない。
      expect(cleanJaeuSpacesInHtml('<p>例え ABC<code>const x = 1; // 数値</code></p>'))
        .toBe('<p>例えABC<code>const x = 1; // 数値</code></p>');
    });

    it('<pre> の中身は触らない（コードブロック）', () => {
      const input = '<pre>npm install vivliostyle 後 に 実行</pre>';
      expect(cleanJaeuSpacesInHtml(input)).toBe(input);
    });

    it('<style> の中身は触らない', () => {
      const input = '<style>/* 注釈 */ body { color: red; }</style>';
      expect(cleanJaeuSpacesInHtml(input)).toBe(input);
    });

    it('<script> の中身は触らない', () => {
      const input = '<script>const x = "値 1";</script>';
      expect(cleanJaeuSpacesInHtml(input)).toBe(input);
    });

    it('<kbd> の中身は触らない', () => {
      const input = '<p>キー: <kbd>Ctrl + 矢印</kbd></p>';
      expect(cleanJaeuSpacesInHtml(input)).toBe(input);
    });
  });

  describe('エッジケース', () => {
    it('空文字列', () => {
      expect(cleanJaeuSpacesInHtml('')).toBe('');
    });

    it('保護タグの属性内に登場するスペースは prose とみなさない（属性値はそもそも保護対象タグの一部）', () => {
      // <code class="lang-js">…</code> の class 属性は保護タグ範囲なので不変
      const input = '<code class="ja コード">x = 1</code>';
      expect(cleanJaeuSpacesInHtml(input)).toBe(input);
    });

    it('混在: prose は詰めるが保護タグ内は不変', () => {
      // prose の "v2.40 から" は ASCII+JA 境界として詰める。
      // code 内の "0 1 1 0" は ASCII 同士のスペースなので元々対象外。
      const input = '<p>v2.40 から<code>device-cmyk(0 1 1 0)</code>が使える</p>';
      const expected = '<p>v2.40から<code>device-cmyk(0 1 1 0)</code>が使える</p>';
      expect(cleanJaeuSpacesInHtml(input)).toBe(expected);
    });
  });
});
