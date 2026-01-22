import Accident from "../models/Accident.js";
import Claim from "../models/Claim.js";
// import { Parser } from "json2csv"; // Removed in favor of Transform
// import { Transform } from "json2csv"; // Handled in chunk above? No, imports must be top level or carefully managed.
// Let's just fix imports properly.

import PDFDocument from "pdfkit";

import { Transform } from "json2csv";
import { pipeline } from "stream/promises";

export const exportAccidentsCSV = async (req, res) => {
  try {
    const fields = ["_id", "userId.name", "userId.email", "userId.vehicleNumber", "prediction.severity", "repair_cost.estimated_cost", "location.address", "createdAt"];
    const opts = { fields };
    const transform = new Transform(opts);

    res.header("Content-Type", "text/csv");
    res.attachment("accidents.csv");

    const cursor = Accident.find().populate("userId", "name email vehicleNumber").lean().cursor();

    await pipeline(cursor, transform, res);
  } catch (err) {
    console.error("exportAccidentsCSV error:", err);
    if (!res.headersSent) res.status(500).json({ message: err.message });
  }
};

export const exportClaimsCSV = async (req, res) => {
  try {
    const fields = ["_id", "driverId.name", "driverId.email", "severity", "estimatedCost", "status", "createdAt"];
    const opts = { fields };
    const transform = new Transform(opts);

    res.header("Content-Type", "text/csv");
    res.attachment("claims.csv");

    const cursor = Claim.find().populate("driverId", "name email").populate("reportId").lean().cursor();

    await pipeline(cursor, transform, res);
  } catch (err) {
    console.error("exportClaimsCSV error:", err);
    if (!res.headersSent) res.status(500).json({ message: err.message });
  }
};

export const exportAccidentSummaryPDF = async (req, res) => {
  try {

    const totalAccidents = await Accident.countDocuments();
    const severityAgg = await Accident.aggregate([{ $group: { _id: "$prediction.severity", count: { $sum: 1 } } }]);

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=accident_summary.pdf");
    doc.text("AutoSureAI — Accident Summary Report", { align: "center", underline: true });
    doc.moveDown();
    doc.text(`Total Accidents: ${totalAccidents}`);
    doc.moveDown();
    doc.text("By Severity:");
    severityAgg.forEach(s => doc.text(`${s._id}: ${s.count}`));
    doc.end();
    doc.pipe(res);
  } catch (err) {
    console.error("exportAccidentSummaryPDF error:", err);
    res.status(500).json({ message: err.message });
  }
};