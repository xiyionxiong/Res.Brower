import Notification from '@/components/Notification';
import UseIntl from '@/components/UseIntl/index';
import httpClient from '@/cores/request/index';
import logger from '@/utils/logger';

// import ApkInfo from '@/utils/libs/apk/arsc';

export default class ZipClient {
  reg = /\r?\n/;

  static get it() {
    return new ZipClient();
  }

  // https://stuk.github.io/jszip/documentation/api_zipobject/async.html

  async readApkFile(file, parseIcon = false) {
    return new Promise(async (resolve) => {
      import(/* webpackChunkName:"package_jszip" */ './jszip.min.js').then(
        async ({ default: JSZip }) => {
          const jszip = new JSZip();
          const zip = await jszip.loadAsync(file);
          let size = 0;

          let certBase64;
          let iconFile;
          let iconBase64;

          // Promise.all([
          //   zip.file('AndroidManifest.xml').async('arraybuffer'),
          //   zip.file('resources.arsc').async('arraybuffer'),
          // ]).then(async ([mainifest, arsc]) => {
          //   logger.d('mainifest>>', mainifest);
          //   logger.d('arsc>>', arsc);

          //   const apkInfo = new ApkInfo(mainifest, arsc);
          //   console.log(
          //     `解析成功！包名：${apkInfo.getPackage()}，version：${apkInfo.getVersionName()}, label: ${apkInfo.getLabel()}`,

          //     `icon: ${await apkInfo.getIcon(zip)}`,
          //   );
          // });

          for (let key in zip.files) {
            // 循环遍历文件夹下的文件
            const targetFile = zip.files[key];

            if (targetFile.dir) continue;

            const name = targetFile.name;
            // 解析签名证书
            if (name.toLocaleLowerCase().endsWith('.RSA'.toLocaleLowerCase())) {
              certBase64 = await targetFile.async('base64');
            }

            // 解析icon
            if (parseIcon && name.indexOf('ic_launcher') > -1 && name.endsWith('.png')) {
              const {
                _data: { compressedSize },
              } = targetFile;
              if (compressedSize > size) {
                size = compressedSize;
                iconFile = targetFile;
              }
            }
          } //for

          if (iconFile) iconBase64 = await iconFile.async('base64');

          resolve({
            certBase64,
            iconBase64: iconBase64 ? `data:image/png;base64,${iconBase64}` : undefined,
          });
        },
      );
    });

    // const manifestBuffer = await zip.file( "AndroidManifest.xml" ).async( "arraybuffer" )

    // const resourcesBuffer = await zip.file( "resources.arsc" ).async( "arraybuffer" )

    // const apkInfo = new ApkInfo( manifestBuffer, resourcesBuffer )
    // //logger.d( apkInfo )
    // // //logger.d( apkInfo.getTagAttributeArray
    // //   () )

    // // const { manifest: {
    // //   stringChunk: { stringPool }
    // // } } = apkInfo
    // // //logger.d( stringPool.join( ',' ) )
    // //logger.d( `解析成功！包名：${ apkInfo.getPackage() }，version：${ apkInfo.getVersionName() }, label: ${ apkInfo.getLabel() }` )
  }

  arrayBufferToString(buffer) {
    var bufView = new Uint16Array(buffer);
    var length = bufView.length;
    var result = '';
    var addition = Math.pow(2, 16) - 1;

    for (var i = 0; i < length; i += addition) {
      if (i + addition > length) {
        addition = length - i;
      }
      result += String.fromCharCode.apply(null, bufView.subarray(i, i + addition));
    }

    return result;
  }

  /**
   *
   * @param {File} file zip文件
   * @param {(text:string)=>void ?} callback 回调进度信息
   * @return 解析信息
   */
  async readZipFile(file, callback = () => {}) {
    logger.d('❎读取zip文件');

    return new Promise((resolve) => {
      import(/* webpackChunkName:"package_jszip" */ './jszip.min.js').then(
        async ({ default: JSZip }) => {
          const jszip = new JSZip();
          callback && callback('开始解析zip文件...');
          const zip = await jszip.loadAsync(file);
          logger.d('✅读取zip文件', zip.files);
          const fileTarget = zip.files['META-INF/com/google/android/updater-script'];
          if (!fileTarget) {
            Notification({
              message: UseIntl({
                id: 'pages.ota.zip.error',
                defaultMessage: '该OTA包缺少描述文件，请联系系统工程师',
              }),
            });
            return resolve(1);
          }
          const result = await fileTarget.async('string');
          //解析 updater-script 内容转成json对象
          const object = this.parseScript2Json(result);
          // object.otaMD5 = md5
          object.appSize = file.size;
          // P5 rom的逻辑
          const extend = await this.generateExtend(zip);
          if (extend) object.extend = extend;

          callback && callback('解析zip文件成功...');

          //logger.d('✅本地解析zip包信息', object);

          callback && callback('开始校验zip文件...');

          const info = await httpClient.post('/device/service/api/ota/verify/complement', object);
          //logger.d('✅获取服务器返回解析信息', info);

          if (info.code === 0) {
            callback && callback('开始上传zip文件...');
            return resolve(info.data);
          }
          callback && callback('校验zip文件文件失败：' + info.message);
          Notification(info);
          return resolve(1);
        },
      );
    });
  }

  /**
   * 如果是p5的设备 rom
   * @param {Zip} zip
   * @returns
   */
  async generateExtend(zip) {
    // 包含 payload_properties.txt文件；
    let fileTarget = zip.files['payload_properties.txt'];
    if (!fileTarget) return;
    const extra = await fileTarget.async('string');
    const headers = extra.split(this.reg).filter((i) => !!i);
    const extend = { headers };
    // 处理 payload.bin
    fileTarget = zip.files['payload.bin'];
    if (!fileTarget) return extend;
    const {
      _data: {
        compressedContent: { byteOffset, byteLength },
      },
    } = fileTarget;
    extend.payloadSize = byteLength;
    extend.payloadOffset = byteOffset;
    return extend;
  }

  /**
   * 解析 updater-script 内容转成json对象
   * @param {string} script
   * @returns
   */
  parseScript2Json(script) {
    return Object.fromEntries(
      new URLSearchParams(
        script
          .split(this.reg)
          .filter((i) => !!i)
          .filter((i) => i.startsWith('# '))
          .map((i) => i.slice(2))
          .join('&'),
      ).entries(),
    );
  }
}
