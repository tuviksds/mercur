import { describe, expect, test } from "vitest"
import type { ProductCreateSchemaType } from "./types"
import { normalizeProductFormValues } from "./utils"

describe("Подготовка вариантов для штатного создания товара", () => {
  test.each([
    {
      name: "товар без характеристик",
      attributes: [],
      options: {},
      expectedAttributes: undefined,
      expectedOptions: undefined,
    },
    {
      name: "товар с готовой информационной характеристикой",
      attributes: [{
        attribute_id: "attribute_material", title: "Material", type: "single_select",
        is_custom: false, use_for_variants: false, values: ["Natural"],
        available_values: [{ id: "value_natural", name: "Natural" }],
      }],
      options: {},
      expectedAttributes: [{ id: "attribute_material", value_ids: ["value_natural"] }],
      expectedOptions: undefined,
    },
    {
      name: "вариант с готовой осью",
      attributes: [{
        attribute_id: "attribute_size", title: "Size", type: "multi_select",
        is_custom: false, use_for_variants: true, values: ["L"],
        available_values: [{ id: "value_large", name: "L" }],
      }],
      options: { Size: "L" },
      expectedAttributes: [{ id: "attribute_size", value_ids: ["value_large"] }],
      expectedOptions: { Size: "L" },
    },
    {
      name: "вариант с явно созданной осью",
      attributes: [{
        title: "Size", type: "multi_select", is_custom: true,
        use_for_variants: true, values: ["S", "L"],
      }],
      options: { Size: "L" },
      expectedAttributes: [{ title: "Size", type: "multi_select", values: ["S", "L"], is_variant_axis: true }],
      expectedOptions: { Size: "L" },
    },
  ])("$name", ({ attributes, options, expectedAttributes, expectedOptions }) => {
    const values: ProductCreateSchemaType = {
      title: "Товар", discountable: true, category_id: "category_clothing",
      attributes,
      variants: [{ title: "Вариант", should_create: true, variant_rank: 0, options }],
    }
    const result = normalizeProductFormValues({
      ...values, status: "draft",
    })
    expect(result).toMatchObject({
      attributes: expectedAttributes,
      variants: [{ title: "Вариант", options: expectedOptions }],
    })
  })
})
