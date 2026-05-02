import { Request, Response } from "express";
import { esClient } from "../utils/esClient";

export const getEmailsController = async (req: Request, res: Response) => {
  try {
    const size = Number(req.query.size || 20);

    const result = await esClient.search({
      index: "emails-v2",
      size,
      sort: [{ date: { order: "desc" } }],
    });

    const emails = result.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source,
    }));

    res.status(200).json({ count: emails.length, emails });
  } catch (error) {
    res.status(500).json({ message: "failed to fetch emails", error });
  }
};