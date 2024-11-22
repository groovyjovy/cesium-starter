class InitDb < ActiveRecord::Migration[7.2]
    def change
        enable_extension 'postgis'
        create_table :borings do |t|
            t.string :dtd_version, null: false, comment: 'DTDバージョン'
            t.string :btb_version, null: false, comment: 'BTBバージョン'
            t.string :survey_name, null: false, comment: '調査名'
            t.st_point :latlon, null: false, comment: '緯度経度', srid: 4326
            t.integer :kunijiban_id, null: false, comment: '国土地盤情報に格納されているXMLのID'

            t.timestamps
        end

        create_table :layers do |t|
            t.references :boring, null: false, foreign_key: true, comment: 'ボーリングID'
            t.float :top, null: false, comment: '上部深度'
            t.float :bottom, null: false, comment: '下部深度'
            t.string :soil_name, null: false, comment: '土質名'
            t.string :soil_symbol, null: false, comment: '土質記号'
            t.string :soil_color, null: false, comment: '色調'
        end
    end
end
