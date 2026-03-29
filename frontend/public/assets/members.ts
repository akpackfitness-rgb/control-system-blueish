import { Router, type IRouter } from "express";
import { sheetsGet, normalizeMember } from "../lib/sheets.js";

const router: IRouter = Router();

router.get("/members/:membershipId", async (req, res) => {
  try {
    const { membershipId } = req.params;
    const data = await sheetsGet({ action: "getMemberById", membershipId });

    if (!data || data.error || !data["Client Name"]) {
      res.status(404).json({ error: "Member not found" });
      return;
    }

    res.json(normalizeMember(data));
  } catch (err) {
    console.error("Error fetching member:", err);
    res.status(500).json({ error: "Failed to fetch member" });
  }
});

router.get("/members", async (_req, res) => {
  try {
    const data = await sheetsGet({ action: "getMembers" });

    if (!Array.isArray(data)) {
      res.json([]);
      return;
    }

    res.json(data.map(normalizeMember));
  } catch (err) {
    console.error("Error fetching members:", err);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

export default router;
