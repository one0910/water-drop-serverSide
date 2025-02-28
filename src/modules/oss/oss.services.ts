import { Injectable } from "@nestjs/common";
import * as dayjs from 'dayjs'
import * as OSS from 'ali-oss'
import { OSSType } from "./dto/oss.type";

@Injectable() /*UserServices作為一個實體 ,透過@Injectable()這個修飾器，
允許我們所建立的實體整個都註冊到整個系統的IoC容器（Inversion of Control Container）
簡單講就是將我們所建立的註冊類別的概念
*/
export class OSSServices {
  async getSignature(): Promise<OSSType> {
    const config = {
      accessKeyId: process.env.ACCESS_KEY_ID,
      accessKeySecret: process.env.ACCESS_KEY_SECRET,
      bucket: "aliyun-oss-test-water-drop",
      dir: "images/",
    };

    const client = new OSS(config);
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const policy = {
      expiration: date.toISOString(), // 请求有效期
      conditions: [
        ["content-length-range", 0, 1048576000], // 设置上传文件的大小限制
      ],
    };

    //去阿里雲去取得bucket域名
    const host = `https://${config.bucket}.${(await client.getBucketLocation()).location
      }.aliyuncs.com`.toString();

    //去阿雲去取得上傳至bucket必要參數，例如AccessKeyId、Signature及policy(token)，有這些參數才能傳檔案至阿里雲
    const formData = await client.calculatePostSignature(policy);

    //再把上讀資料做收集整理，回傳去給前端
    const params = {
      expire: dayjs().add(1, "days").unix().toString(),
      policy: formData.policy,
      signature: formData.Signature,
      accessId: formData.OSSAccessKeyId,
      host,
      dir: 'images',
    };
    return params
  }
}