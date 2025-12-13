import Parser from 'rss-parser';
import { IJob, IJobSearchProvider, SearchOptions } from '../models/IJobSearchProvider';

export class RSSJobProvider implements IJobSearchProvider {
  private parser: Parser;

  constructor() {
    // CORREÇÃO CRÍTICA: Headers para "enganar" o bloqueio do GitHub
    this.parser = new Parser({
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/atom+xml,application/rss+xml,application/xml,text/xml'
      }
    });
  }

  public async findJobs(keywords: string[], options?: SearchOptions): Promise<IJob[]> {
    const limit = options?.limit || 20;
    const daysAgo = options?.daysAgo || 30;

    const cutOffDate = new Date();
    cutOffDate.setDate(cutOffDate.getDate() - daysAgo);

    console.log(`🔎 [RSS] Buscando Vagas (Foco: BR + Remoto Internacional)...`);

    const searchTerms = keywords.map(k => k.toLowerCase());

    const FEEDS = [
      // 🇧🇷 GITHUB BRASIL (Agora com User-Agent correto deve funcionar)
      'https://github.com/backend-br/vagas/issues.atom',
      'https://github.com/frontendbr/vagas/issues.atom',
      'https://github.com/react-brasil/vagas/issues.atom',
      'https://github.com/vuejs-br/vagas/issues.atom',
      'https://github.com/qa-brasil/vagas/issues.atom',
      'https://github.com/androiddevbr/vagas/issues.atom',

      // 🌍 GRINGOS (URLs validadas)
      'https://weworkremotely.com/categories/remote-back-end-programming-jobs.rss',
      'https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss',
      // Corrigido: Remotive Feed Geral (o específico estava dando 404)
      'https://remotive.com/remote-jobs/rss-feed'
    ];

    let allJobs: IJob[] = [];

    const promises = FEEDS.map(async (url) => {
      try {
        const feed = await this.parser.parseURL(url);
        const isGithub = url.includes('github.com');

        for (const item of feed.items) {
          const pubDate = new Date(item.pubDate || item.isoDate || new Date());
          if (pubDate < cutOffDate) continue;

          const title = item.title || '';
          const content = item.content || item.contentSnippet || '';
          const fullText = (title + ' ' + content).toLowerCase();

          // 1. FILTRO DE PALAVRA-CHAVE
          const hasKeyword = searchTerms.some((term) => fullText.includes(term));
          if (!hasKeyword) continue;

          // 2. FILTRO "REMOTO"
          // GitHub BR: Prioriza se tiver "remoto" ou "home office" no texto
          // Feeds Gringos: Já são nativamente remotos
          const isRemote = fullText.includes('remoto') || fullText.includes('remote') || fullText.includes('home office');

          // Se for GitHub e NÃO tiver menção de remoto, ignoramos (para evitar vagas presenciais)
          // Mas se você quiser ser mais flexível, pode comentar esse if
          if (isGithub && !isRemote) {
            continue;
          }

          allJobs.push({
            title: title,
            company: isGithub ? 'GitHub Community' : (item.creator || 'Empresa Confidencial'),
            link: item.link || '',
            date: pubDate,
            description: content.slice(0, 5000),
            source: isGithub ? `GitHub BR (${url.split('/')[4]})` : `RSS - ${new URL(url).hostname}`
          });
        }
      } catch (error) {
        // Agora mostramos o erro mas não paramos o processo
        console.warn(`⚠️ Falha no feed ${url}: ${(error as Error).message}`);
      }
    });

    await Promise.all(promises);

    const uniqueJobs = Array.from(new Map(allJobs.map(job => [job.link, job])).values());
    const sortedJobs = uniqueJobs.sort((a, b) => b.date.getTime() - a.date.getTime());

    return sortedJobs.slice(0, limit);
  }
}