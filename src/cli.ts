import { program, Command } from 'commander';
import packageJson from '../package.json';
import nodeHtmlParser from 'node-html-parser';
import axios from 'axios';

import { config } from 'dotenv';
config();

/**
 * Set global CLI configurations
 */
program.storeOptionsAsProperties(false);

program.version(packageJson.version, '-v, --version');

const crawlCommand = new Command('crawl');
crawlCommand.description('crawl services');

crawlCommand
  .command('suumo')
  .description('')
  .action(async (options: any) => {
    console.log('suumo crawler');
  });

crawlCommand
  .command('suumo:rooturl')
  .description('')
  .action(async (options: any) => {
    const searchUrl = new URL('https://suumo.jp/chintai/');
    const response = await axios.get(searchUrl.toString());
    const root = nodeHtmlParser.parse(response.data.toString());
    const itemDoms = root.querySelectorAll('.stripe_lists-line');
    for (const itemDom of itemDoms) {
      const itemAtagDoms = itemDom.querySelectorAll('a');
      for (const itemAtagDom of itemAtagDoms) {
        const aTagAttrs = itemAtagDom.attrs || {};
        searchUrl.pathname = aTagAttrs.href;
        const crawlRootUrlInfos = await loadSuumoCrawlRootUrlInfos(searchUrl.toString());
        console.log(crawlRootUrlInfos);
      }
    }
  });

async function loadSuumoCrawlRootUrlInfos(rootUrl: string): Promise<{ url: string; title: string }[]> {
  const crawlRootUrlInfos: { url: string; title: string }[] = [];
  const searchUrl = new URL(rootUrl);
  const response = await axios.get(searchUrl.toString());
  const root = nodeHtmlParser.parse(response.data.toString());
  const itemDoms = root.querySelectorAll('ul.itemtoplist');
  for (const itemDom of itemDoms) {
    const itemAtagDoms = itemDom.querySelectorAll('a');
    for (const itemAtagDom of itemAtagDoms) {
      const aTagAttrs = itemAtagDom.attrs || {};
      searchUrl.pathname = aTagAttrs.href;
      crawlRootUrlInfos.push({
        url: searchUrl.toString(),
        title: itemAtagDom.text,
      });
    }
  }
  return crawlRootUrlInfos;
}

program.addCommand(crawlCommand);

const exportCommand = new Command('export');

exportCommand
  .command('sql')
  .description('')
  .action(async (options: any) => {
    //    await exportToInsertSQL();
  });

program.addCommand(exportCommand);

program.parse(process.argv);
