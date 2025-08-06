import { Injectable } from '@nestjs/common';
import { SeniorityLevel } from '@prisma/client';
import * as cheerio from 'cheerio';
import * as axios from 'axios';
import { DatabaseService } from 'src/common/database/database.service';

export interface ProspectData {
  name: string;
  headline?: string;
  company?: string;
  industry?: string;
  seniorityLevel?: SeniorityLevel;
  location?: string;
  rawData: any;
}

@Injectable()
export class ProspectiveService {
  constructor(private readonly databaseService: DatabaseService) {}

  generateMockProspectData(url: string) {
    const name = this.extractNameFromUrl(url);
    const mockData = this.generateRealisticMockData(name);

    return {
      success: true,
      data: {
        name: mockData.name,
        headline: mockData.headline,
        company: mockData.company,
        industry: mockData.industry,
        location: mockData.location,
        seniorityLevel: mockData.seniorityLevel,
        rawData: {
          url,
          method: 'mock_data',
          note: 'This is mock data for development/demo purposes',
        },
      },
    };
  }

  private extractNameFromUrl(url: string): string {
    const match = url.match(/\/in\/([^\/\?]+)/);
    if (match) {
      return match[1]
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase())
        .replace(/\d+/g, '') // Remove numbers
        .trim();
    }
    return 'Unknown Professional';
  }

  private generateRealisticMockData(name: string) {
    const companies = [
      'Microsoft',
      'Google',
      'Amazon',
      'Salesforce',
      'HubSpot',
      'Slack',
      'Zoom',
      'Dropbox',
      'Stripe',
      'Shopify',
    ];

    const industries = [
      'Technology',
      'Software',
      'SaaS',
      'E-commerce',
      'Financial Services',
      'Healthcare',
      'Marketing',
    ];

    const locations = [
      'San Francisco, CA',
      'New York, NY',
      'Seattle, WA',
      'Austin, TX',
      'Boston, MA',
      'Chicago, IL',
      'Los Angeles, CA',
    ];

    const titles = [
      'VP of Sales',
      'Director of Marketing',
      'Head of Business Development',
      'Senior Account Executive',
      'Marketing Manager',
      'Sales Manager',
      'Chief Technology Officer',
      'Product Manager',
      'Customer Success Director',
    ];

    const randomCompany =
      companies[Math.floor(Math.random() * companies.length)];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];

    return {
      name,
      headline: `${randomTitle} at ${randomCompany} | Driving Growth & Innovation`,
      company: randomCompany,
      industry: industries[Math.floor(Math.random() * industries.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      seniorityLevel: this.toSeniorityLevelEnum(
        this.determineSeniorityFromTitle(randomTitle),
      ),
    };
  }

  private determineSeniorityFromTitle(title: string): string {
    const seniorTitles = ['VP', 'Director', 'Head', 'Chief', 'CTO', 'CEO'];
    const juniorTitles = ['Associate', 'Junior', 'Coordinator', 'Specialist'];

    if (seniorTitles.some((t) => title.includes(t))) return 'senior';
    if (juniorTitles.some((t) => title.includes(t))) return 'junior';
    return 'mid';
  }

  private toSeniorityLevelEnum(level: string): SeniorityLevel {
    switch (level) {
      case 'senior':
        return SeniorityLevel.senior;
      case 'junior':
        return SeniorityLevel.junior;
      case 'mid':
      default:
        return SeniorityLevel.mid;
    }
  }

  async scrapeLinkedInProfile(url: string): Promise<ProspectData> {
    return this.generateMockProspectData(url).data;
  }

  async saveProspect(prospectData: ProspectData, linkedinUrl: string) {
    return this.databaseService.prospect.upsert({
      where: { linkedinUrl },
      update: {
        name: prospectData.name,
        headline: prospectData.headline,
        company: prospectData.company,
        industry: prospectData.industry,
        seniorityLevel: prospectData.seniorityLevel,
        location: prospectData.location,
        rawData: prospectData.rawData,
      },
      create: {
        name: prospectData.name,
        headline: prospectData.headline,
        company: prospectData.company,
        industry: prospectData.industry,
        seniorityLevel: prospectData.seniorityLevel,
        location: prospectData.location,
        linkedinUrl,
        rawData: prospectData.rawData,
      },
    });
  }

  private extractCompanyFromHeadline(headline: string): string {
    const companyIndicators = [
      'at ',
      'CEO of ',
      'Founder of ',
      'VP of ',
      'Director at ',
    ];
    for (const indicator of companyIndicators) {
      const index = headline.toLowerCase().indexOf(indicator.toLowerCase());
      if (index !== -1) {
        const company = headline
          .substring(index + indicator.length)
          .split(',')[0]
          .split('|')[0]
          .trim();
        return company || 'Unknown';
      }
    }
    return 'Unknown';
  }

  private extractIndustryFromHeadline(headline: string): string {
    const industries = [
      'SaaS',
      'Technology',
      'Finance',
      'Healthcare',
      'Marketing',
      'Sales',
      'Consulting',
    ];
    for (const industry of industries) {
      if (headline.toLowerCase().includes(industry.toLowerCase())) {
        return industry;
      }
    }
    return 'Technology';
  }

  private determineSeniorityLevel(headline: string): SeniorityLevel {
    const senior = ['CEO', 'CTO', 'VP', 'Director', 'Head of', 'Chief'];
    const junior = ['Associate', 'Junior', 'Intern', 'Coordinator'];

    const lowerHeadline = headline.toLowerCase();

    if (senior.some((title) => lowerHeadline.includes(title.toLowerCase()))) {
      return SeniorityLevel.senior;
    }
    if (junior.some((title) => lowerHeadline.includes(title.toLowerCase()))) {
      return SeniorityLevel.junior;
    }
    return SeniorityLevel.mid;
  }

  //   private extractNameFromUrl(url: string): string {
  //     const match = url.match(/\/in\/([^\/]+)/);
  //     if (match) {
  //       return match[1]
  //         .replace(/-/g, ' ')
  //         .replace(/\b\w/g, (l) => l.toUpperCase());
  //     }
  //     return 'Unknown';
  //   }
}
