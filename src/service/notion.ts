import { Client } from '@notionhq/client';
import { RequestParameters } from '@notionhq/client/build/src/Client';

import { Env } from '../config';

// TODO

export class Notion {
  static #instance: Notion;

  #customerComplaint?: Client;

  constructor(private config: Env) {
    if (Notion.#instance instanceof Notion) {
      return Notion.#instance;
    }

    if (config.NOTION_CLIENT_COMPLAINT_TOKEN && config.NOTION_CLIENT_COMPLAINT_DATABSE) {
      this.#customerComplaint = new Client({ auth: config.NOTION_CLIENT_COMPLAINT_TOKEN });
    }

    Notion.#instance = this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTabletComplaints = async (): Promise<any> => {
    const payload: RequestParameters = {
      path: `databases/${this.config.NOTION_CLIENT_COMPLAINT_DATABSE}/query`,
      method: 'post',
      body: {
        filter: {
          property: 'Root Cause',
          multi_select: {
            contains: 'Tablet App',
          },
        },
      },
    };

    if (!this.#customerComplaint) {
      throw new Error('Initilize customer complaint Notion client');
    }

    const { results } = await this.#customerComplaint.request(payload);
    return results;
  };
}
