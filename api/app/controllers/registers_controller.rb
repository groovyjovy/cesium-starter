class RegistersController < ApplicationController
  def index
    require 'utils/latlon'

    # Shift_JISをUTF-8に変換
    xml_data = File.read('./xmls/sample.xml')

    doc = Nokogiri::XML(xml_data)
    Ratlon.to_decimal(degree: doc.xpath('//lat_d').text.to_i, minute: doc.xpath('//lat_m').text.to_i,
                      second: doc.xpath('//lat_s').text.to_i)
    Ratlon.to_decimal(degree: doc.xpath('//lon_d').text.to_i, minute: doc.xpath('//lon_m').text.to_i,
                      second: doc.xpath('//lon_s').text.to_i)

    render json: { message: 'Hello, world!' }
  end
end
