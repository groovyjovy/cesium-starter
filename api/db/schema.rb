# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2024_11_22_094000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "postgis"

  create_table "borings", force: :cascade do |t|
    t.string "dtd_version", null: false, comment: "DTDバージョン"
    t.string "btb_version", null: false, comment: "BTBバージョン"
    t.string "survey_name", null: false, comment: "調査名"
    t.geometry "latlon", limit: {:srid=>4326, :type=>"st_point"}, null: false, comment: "緯度経度"
    t.integer "kunijiban_id", null: false, comment: "国土地盤情報に格納されているXMLのID"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "layers", force: :cascade do |t|
    t.bigint "boring_id", null: false, comment: "ボーリングID"
    t.float "top", null: false, comment: "上部深度"
    t.float "bottom", null: false, comment: "下部深度"
    t.string "soil_name", null: false, comment: "土質名"
    t.string "soil_symbol", null: false, comment: "土質記号"
    t.string "soil_color", null: false, comment: "色調"
    t.index ["boring_id"], name: "index_layers_on_boring_id"
  end

  add_foreign_key "layers", "borings"
end
