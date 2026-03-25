import pool from "../../config/db.js";
import { success, error, paginated } from "../../utils/response.js";

// ── Image JOIN helper ─────────────────────────────────
const IMAGE_JOIN = `
  LEFT JOIN (
    SELECT medicine_id, image_url
    FROM medicine_images
    WHERE is_primary = 1
  ) mi ON mi.medicine_id = m.id
`;

// ── Get all medicines ─────────────────────────────────
export const getMedicines = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      featured,
      sort = "id",
    } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let where = "WHERE m.is_active = TRUE";

    if (category) {
      where += " AND c.slug = ?";
      params.push(category);
    }
    if (search) {
      where +=
        " AND (m.name LIKE ? OR m.generic_name LIKE ? OR m.brand LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (featured === "true") {
      where += " AND m.is_featured = TRUE";
    }

    const sortMap = {
      id: "m.id DESC",
      price: "mb.selling_price ASC",
      price_desc: "mb.selling_price DESC",
      name: "m.name ASC",
      latest: "m.created_at DESC",
      discount: "mb.discount_percent DESC",
    };
    const orderBy = sortMap[sort] || "m.id DESC";

    // const sql = `
    //   SELECT
    //     m.id, m.name, m.slug, m.generic_name, m.brand,
    //     m.pack_size, m.unit, m.requires_prescription, m.is_featured,
    //     ds.schedule_code,
    //     c.name  AS category_name,
    //     c.slug  AS category_slug,
    //     mf.name AS manufacturer_name,
    //     mi.image_url,
    //     mb.id AS batch_id,
    //     mb.id AS stock_id,
    //     mb.selling_price,
    //     mb.mrp,
    //     mb.discount_percent,
    //     mb.available_quantity,
    //     mb.expiry_date,
    //     mb.batch_status
    //   FROM medicines m
    //   LEFT JOIN categories       c  ON m.category_id    = c.id
    //   LEFT JOIN manufacturers    mf ON m.manufacturer_id = mf.id
    //   LEFT JOIN drug_schedules   ds ON m.schedule_id     = ds.id
    //   ${IMAGE_JOIN}
    //   LEFT JOIN medicine_batches mb ON mb.id = (
    //     SELECT id FROM medicine_batches
    //     WHERE medicine_id = m.id
    //       AND is_active = TRUE
    //       AND batch_status != 'expired'
    //       AND available_quantity > 0
    //     ORDER BY expiry_date ASC
    //     LIMIT 1
    //   )
    //   ${where}
    //   ORDER BY ${orderBy}
    //   LIMIT ? OFFSET ?
    // `;
const sql = `
  SELECT
    m.id, m.name, m.slug, m.generic_name, m.brand,
    m.pack_size, m.unit, m.requires_prescription, m.is_featured,
    ds.schedule_code,
    c.name  AS category_name,
    c.slug  AS category_slug,
    mf.name AS manufacturer_name,
    mi.image_url,
    mb.id AS batch_id,
    mb.id AS stock_id,
    mb.selling_price,
    mb.mrp,
    mb.discount_percent,
    mb.available_quantity,
    mb.expiry_date,
    mb.batch_status
  FROM medicines m
  LEFT JOIN categories       c  ON m.category_id    = c.id
  LEFT JOIN manufacturers    mf ON m.manufacturer_id = mf.id
  LEFT JOIN drug_schedules   ds ON m.schedule_id     = ds.id
  LEFT JOIN (
    SELECT medicine_id, image_url
    FROM medicine_images
    WHERE is_primary = 1
  ) mi ON mi.medicine_id = m.id
  LEFT JOIN (
    SELECT mb1.*
    FROM medicine_batches mb1
    INNER JOIN (
      SELECT medicine_id, MIN(expiry_date) AS min_expiry
      FROM medicine_batches
      WHERE is_active = 1
        AND batch_status != 'expired'
        AND available_quantity > 0
      GROUP BY medicine_id
    ) mb2 ON mb1.medicine_id = mb2.medicine_id
          AND mb1.expiry_date = mb2.min_expiry
    WHERE mb1.is_active = 1
  ) mb ON mb.medicine_id = m.id
  ${where}
  ORDER BY ${orderBy}
  LIMIT ? OFFSET ?
`;
    const countSql = `
      SELECT COUNT(DISTINCT m.id) AS total
      FROM medicines m
      LEFT JOIN categories c ON m.category_id = c.id
      ${where}
    `;

    const [rows] = await pool.query(sql, [
      ...params,
      parseInt(limit),
      parseInt(offset),
    ]);
    const [count] = await pool.query(countSql, params);

    return paginated(
      res,
      rows,
      count[0].total,
      page,
      limit,
      "Medicines retrieved successfully.",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Internal server error while fetching medicines.", 500);
  }
};

// ── Get featured medicines ────────────────────────────
export const getFeaturedMedicines = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        m.id, m.name, m.slug, m.generic_name, m.brand,
        m.pack_size, m.unit, m.requires_prescription,
        ds.schedule_code,
        c.name AS category_name,
        c.slug AS category_slug,
        mi.image_url,
        mb.id AS batch_id,
        mb.id AS stock_id,
        mb.selling_price,
        mb.mrp,
        mb.discount_percent,
        mb.available_quantity
      FROM medicines m
      LEFT JOIN categories       c  ON m.category_id    = c.id
      LEFT JOIN drug_schedules   ds ON m.schedule_id     = ds.id
      ${IMAGE_JOIN}
      LEFT JOIN medicine_batches mb ON mb.id = (
        SELECT id FROM medicine_batches
        WHERE medicine_id = m.id
          AND is_active = TRUE
          AND available_quantity > 0
        ORDER BY expiry_date ASC
        LIMIT 1
      )
      WHERE m.is_active = TRUE AND m.is_featured = TRUE
      ORDER BY m.id DESC
      LIMIT 8
    `);
    return success(res, rows, "Featured medicines retrieved successfully.");
  } catch (err) {
    console.error(err);
    return error(
      res,
      "Internal server error while fetching featured medicines.",
      500,
    );
  }
};

// ── Get single medicine ───────────────────────────────
export const getMedicineById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        m.*,
        ds.schedule_code, ds.schedule_name,
        c.name  AS category_name,
        c.slug  AS category_slug,
        mf.name AS manufacturer_name,
        mi.image_url,
        mb.id   AS stock_id,
        mb.id   AS batch_id,
        mb.batch_no, mb.selling_price, mb.mrp,
        mb.discount_percent, mb.available_quantity, mb.expiry_date
      FROM medicines m
      LEFT JOIN categories       c  ON m.category_id    = c.id
      LEFT JOIN manufacturers    mf ON m.manufacturer_id = mf.id
      LEFT JOIN drug_schedules   ds ON m.schedule_id     = ds.id
      ${IMAGE_JOIN}
      LEFT JOIN medicine_batches mb ON mb.id = (
        SELECT id FROM medicine_batches
        WHERE medicine_id = m.id AND is_active = TRUE AND available_quantity > 0
        ORDER BY expiry_date ASC LIMIT 1
      )
      WHERE m.id = ? AND m.is_active = TRUE
    `,
      [id],
    );

    if (rows.length === 0)
      return error(res, "Medicine product not found.", 404);

    const [images] = await pool.query(
      `
      SELECT image_url, is_primary, sort_order
      FROM medicine_images
      WHERE medicine_id = ?
      ORDER BY sort_order ASC
    `,
      [id],
    );

    return success(
      res,
      { ...rows[0], images },
      "Medicine details retrieved successfully.",
    );
  } catch (err) {
    console.error(err);
    return error(
      res,
      "Internal server error while fetching medicine details.",
      500,
    );
  }
};

// ── Get categories ────────────────────────────────────
export const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.id, c.name, c.slug, c.image,
        COUNT(m.id) AS medicine_count
      FROM categories c
      LEFT JOIN medicines m ON m.category_id = c.id AND m.is_active = TRUE
      WHERE c.is_active = TRUE AND c.parent_id IS NULL
      GROUP BY c.id, c.name, c.slug, c.image
      ORDER BY c.sort_order ASC
    `);
    return success(res, rows, "Categories retrieved successfully.");
  } catch (err) {
    console.error(err);
    return error(res, "Internal server error while fetching categories.", 500);
  }
};
