import logger from "@/components/logger.tsx";
import { useWorkspaceStore } from "@/components/store.tsx";
import { DialogSequence } from "@/components/dialog-sequences.tsx";

/**
 * Minecraft 语言代码枚举
 * 定义了支持的语言代码及其对应的 Minecraft 内部标识符
 */
export enum MinecraftLanguageCode {
  "zh-CN" = "zh_cn",
  "zh-HK" = "zh_hk",
  "zh-TW" = "zh_tw",
  "en-US" = "en_us",
}

/**
 * 语言显示名称枚举
 * 定义了各语言代码对应的显示名称
 */
export enum Language {
  "zh-CN" = "简体中文",
  "zh-HK" = "繁体中文 (中国香港)",
  "zh-TW" = "繁体中文 (中国台湾)",
  "en-US" = "English (US)",
}

/**
 * 获取当前浏览器的语言代码
 * @returns {string} 浏览器语言代码
 */
export function getLanguageCode(): string {
  return navigator.language;
}

/**
 * 获取当前语言的显示名称
 * @returns {string} 语言显示名称，如果未找到则返回默认的英文
 */
export function getLanguage(): Language {
  const language = getLanguageCode();

  return Language[language as keyof typeof Language] || Language["en-US"];
}

/**
 * 获取当前语言对应的 Minecraft 语言代码
 * @param {keyof typeof Language} [lang] 可选的语言代码，如果不提供则使用系统默认语言
 * @returns {string} Minecraft 语言代码，如果未找到则返回默认的英文代码
 */
export function getMinecraftLanguageCode(
  lang?: keyof typeof Language,
): MinecraftLanguageCode {
  const language = lang || getLanguageCode();

  return (
    MinecraftLanguageCode[language as keyof typeof MinecraftLanguageCode] ||
    MinecraftLanguageCode["en-US"]
  );
}

/**
 * 写入语言文件到指定目录
 * @param {string} language 语言代码
 * @param {Record<string, string>} data 要写入的语言键值对
 * @param {boolean} override 是否覆盖现有文件，默认为 false（合并模式）
 * @returns {Promise<Record<string, string>>} 合并后的语言键值对
 */
export const writeLanguageFile = async (
  language: string,
  data: Record<string, string>,
  override: boolean = false,
): Promise<Record<string, string>> => {
  // 获取当前工作区的资源文件夹句柄
  const assessFolder =
    useWorkspaceStore.getState().currentWorkspace?.assessFolder;

  logger.info("写入语言文件", language, data, override);

  // 如果没有资源文件夹则直接返回
  if (!assessFolder) return {};
  let mergedData = {};

  try {
    // 打开工作区时已请求读写权限，如果不授权不会走到这一步
    // 获取 lang 目录句柄
    const langDirHandle = await assessFolder.getDirectoryHandle("lang");

    // 获取或创建目标语言文件句柄
    const fileHandle = await langDirHandle.getFileHandle(language + ".json", {
      create: true,
    });

    // 读取文件内容
    const file = await fileHandle.getFile();
    const content = await file.text();

    // 创建可写流
    const writable = await fileHandle.createWritable();

    // 标记是否需要备份原文件
    let backup = false;

    if (override || content.trim() === "") {
      // 覆盖模式：直接写入新数据
      await writable.write(JSON.stringify(data, null, 2));
      backup = content.trim() !== ""; // 需要备份原文件
      mergedData = data;
    } else {
      // 合并模式：读取现有数据并合并
      let existingData = {};

      try {
        existingData = JSON.parse(content);
      } catch (e) {
        logger.warn("语言文件格式错误", e);
        backup = true; // 解析失败也需要备份
      }

      // 合并现有数据和新数据
      mergedData = { ...existingData, ...data };

      await writable.write(JSON.stringify(mergedData, null, 2));
    }

    // 关闭写入流
    await writable.close();

    // 如果不需要备份则直接返回
    if (!backup) return mergedData;

    // 创建备份文件句柄，文件名包含时间戳
    const backFileHandle = await langDirHandle.getFileHandle(
      language +
        ".json.back." +
        new Date().toISOString().replace(/\D/g, "").slice(0, -3),
      {
        create: true,
      },
    );

    // 写入原文件内容到备份文件
    const backFileWritable = await backFileHandle.createWritable();

    await backFileWritable.write(content);
    await backFileWritable.close();
  } catch (e) {
    logger.warn(e);
  }

  return mergedData;
};

/**
 * 写入对话文件
 * @param id 对话文件的唯一标识符
 * @param dialogSequence 要写入的对话序列
 */
export const writeDialogFile = async (
  id: string,
  dialogSequence: DialogSequence,
): Promise<void> => {
  // 获取当前工作区的资源文件夹句柄
  const dialogsFolder =
    useWorkspaceStore.getState().currentWorkspace?.dialogsFolder;

  logger.info("写入对话文件", id, dialogSequence);

  // 如果没有资源文件夹则直接返回
  if (!dialogsFolder) return;

  try {
    // 获取或创建目标对话文件句柄
    const fileHandle = await dialogsFolder.getFileHandle(id + ".json", {
      create: true,
    });

    // 读取文件内容
    const file = await fileHandle.getFile();
    const content = await file.text();

    // 创建可写流
    const writable = await fileHandle.createWritable();

    // 写入对话序列内容
    await writable.write(JSON.stringify(dialogSequence, null, 2));

    // 关闭写入流
    await writable.close();

    // 创建备份文件句柄，文件名包含时间戳
    const backFileHandle = await dialogsFolder.getFileHandle(
      id +
        ".json.back." +
        new Date().toISOString().replace(/\D/g, "").slice(0, -3),
      {
        create: true,
      },
    );

    // 写入原文件内容到备份文件
    const backFileWritable = await backFileHandle.createWritable();

    await backFileWritable.write(content);
    await backFileWritable.close();
  } catch (e) {
    logger.warn(e);
  }
};
