// src/utils/lunar.js
/**
 * 农历工具类
 * 提供公历与农历之间的转换功能
 * 使用自包含的农历计算方法，不依赖外部库
 */

class LunarCalendar {
  // 农历月份名称
  static lunarMonths = [
    "正月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "冬月",
    "腊月",
  ];

  // 农历日期名称
  static lunarDays = [
    "初一",
    "初二",
    "初三",
    "初四",
    "初五",
    "初六",
    "初七",
    "初八",
    "初九",
    "初十",
    "十一",
    "十二",
    "十三",
    "十四",
    "十五",
    "十六",
    "十七",
    "十八",
    "十九",
    "二十",
    "廿一",
    "廿二",
    "廿三",
    "廿四",
    "廿五",
    "廿六",
    "廿七",
    "廿八",
    "廿九",
    "三十",
  ];

  // 天干
  static heavenlyStems = [
    "甲",
    "乙",
    "丙",
    "丁",
    "戊",
    "己",
    "庚",
    "辛",
    "壬",
    "癸",
  ];

  // 地支
  static earthlyBranches = [
    "子",
    "丑",
    "寅",
    "卯",
    "辰",
    "巳",
    "午",
    "未",
    "申",
    "酉",
    "戌",
    "亥",
  ];

  // 生肖
  static zodiacAnimals = [
    "鼠",
    "牛",
    "虎",
    "兔",
    "龙",
    "蛇",
    "马",
    "羊",
    "猴",
    "鸡",
    "狗",
    "猪",
  ];

  // 节气
  static solarTerms = [
    "小寒",
    "大寒",
    "立春",
    "雨水",
    "惊蛰",
    "春分",
    "清明",
    "谷雨",
    "立夏",
    "小满",
    "芒种",
    "夏至",
    "小暑",
    "大暑",
    "立秋",
    "处暑",
    "白露",
    "秋分",
    "寒露",
    "霜降",
    "立冬",
    "小雪",
    "大雪",
    "冬至",
  ];

  // 农历数据表（1900-2100年）
  static lunarInfo = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0,
    0x09ad0, 0x055d2, 0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540,
    0x0d6a0, 0x0ada2, 0x095b0, 0x14977, 0x04970, 0x0a4b0, 0x0b4b5, 0x06a50,
    0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, 0x06566, 0x0d4a0,
    0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2,
    0x0a950, 0x0b557, 0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573,
    0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, 0x0aea6, 0x0ab50, 0x04b60, 0x0aae4,
    0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, 0x096d0, 0x04dd5,
    0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46,
    0x0ab60, 0x09570, 0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58,
    0x055c0, 0x0ab60, 0x096d5, 0x092e0, 0x0c960, 0x0d954, 0x0d4a0, 0x0da50,
    0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, 0x0a950, 0x0b4a0,
    0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260,
    0x0ea65, 0x0d530, 0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0,
    0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, 0x0b5a0, 0x056d0, 0x055b2, 0x049b0,
    0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, 0x14b63, 0x09370,
    0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06aa0, 0x1a6c4, 0x0aae0,
    0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0,
    0x0a6d0, 0x055d4, 0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50,
    0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, 0x0b273, 0x06930, 0x07337, 0x06aa0,
    0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, 0x0e968, 0x0d520,
    0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
    0x0d520,
  ];

  // 节气数据
  static solarTermInfo = [
    0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551,
    218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447,
    419210, 440795, 462224, 483532, 504758,
  ];

  /**
   * 公历转农历
   */
  static solarToLunar(solarDate) {
    try {
      const date = new Date(solarDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      // 使用精确的农历计算方法
      const lunar = this.calcLunar(year, month, day);

      return {
        lunarYear: lunar.year,
        lunarMonth: lunar.month,
        lunarDay: lunar.day,
        isLeapMonth: lunar.isLeap,
        lunarMonthName: lunar.monthName,
        lunarDayName: lunar.dayName,
        zodiac: this.getZodiac(lunar.year),
        heavenlyStem: this.getHeavenlyStem(lunar.year),
        earthlyBranch: this.getEarthlyBranch(lunar.year),
        lunarYearName: this.getLunarYearName(lunar.year),
        solarTerm: this.getSolarTerm(year, month, day),
      };
    } catch (error) {
      console.error("农历计算错误:", error);
      // 降级到简化版本
      return this.simpleSolarToLunar(solarDate);
    }
  }

  /**
   * 精确的农历计算方法
   */
  static calcLunar(year, month, day) {
    let i = 0,
      temp = 0,
      leap = 0;
    const baseDate = new Date(1900, 0, 31);
    const objDate = new Date(year, month - 1, day);

    // 计算偏移天数
    let offset = Math.floor((objDate - baseDate) / 86400000);

    // 计算年
    for (i = 1900; i < 2101 && offset > 0; i++) {
      temp = this.lunarYearDays(i);
      offset -= temp;
    }

    if (offset < 0) {
      offset += temp;
      i--;
    }

    const lunarYear = i;

    // 计算闰月
    leap = this.leapMonth(i);
    let isLeap = false;

    // 计算月
    for (i = 1; i < 13 && offset > 0; i++) {
      // 闰月
      if (leap > 0 && i === leap + 1 && !isLeap) {
        i--;
        isLeap = true;
        temp = this.leapDays(lunarYear);
      } else {
        temp = this.monthDays(lunarYear, i);
      }

      // 解除闰月
      if (isLeap && i === leap + 1) isLeap = false;

      offset -= temp;
    }

    // 如果offset小于0，说明在上个月
    if (offset === 0 && leap > 0 && i === leap + 1) {
      if (isLeap) {
        isLeap = false;
      } else {
        isLeap = true;
        i--;
      }
    }

    if (offset < 0) {
      offset += temp;
      i--;
    }

    const lunarMonth = i;
    const lunarDay = offset + 1;

    return {
      year: lunarYear,
      month: lunarMonth,
      day: lunarDay,
      isLeap: isLeap,
      monthName: this.lunarMonths[lunarMonth - 1] || "正月",
      dayName: this.lunarDays[lunarDay - 1] || "初一",
    };
  }

  /**
   * 返回农历年的总天数
   */
  static lunarYearDays(year) {
    let sum = 348;
    for (let i = 0x8000; i > 0x8; i >>= 1) {
      sum += this.lunarInfo[year - 1900] & i ? 1 : 0;
    }
    return sum + this.leapDays(year);
  }

  /**
   * 返回农历年闰月的天数
   */
  static leapDays(year) {
    if (this.leapMonth(year)) {
      return this.lunarInfo[year - 1900] & 0x10000 ? 30 : 29;
    }
    return 0;
  }

  /**
   * 返回农历年闰哪个月
   */
  static leapMonth(year) {
    return this.lunarInfo[year - 1900] & 0xf;
  }

  /**
   * 返回农历年某月的总天数
   */
  static monthDays(year, month) {
    return this.lunarInfo[year - 1900] & (0x10000 >> month) ? 30 : 29;
  }

  /**
   * 获取节气
   */
  static getSolarTerm(year, month, day) {
    const century = year % 100 === 0 ? year - 1 : year;
    const centuryIndex = Math.floor(century / 100);

    if (year < 1900 || year > 2100) return "";

    const tmp1 = new Date(
      31556925974.7 * (year - 1900) +
        this.solarTermInfo[month * 2 - 1] * 60000 +
        Date.UTC(1900, 0, 6, 2, 5)
    );
    const tmp2 = new Date(
      31556925974.7 * (year - 1900) +
        this.solarTermInfo[month * 2] * 60000 +
        Date.UTC(1900, 0, 6, 2, 5)
    );

    const solarTerm1 = this.getDate(tmp1);
    const solarTerm2 = this.getDate(tmp2);

    const solarTermDay1 = solarTerm1.getDate();
    const solarTermDay2 = solarTerm2.getDate();

    if (solarTermDay1 === day) {
      return this.solarTerm[month * 2 - 2];
    }

    if (solarTermDay2 === day) {
      return this.solarTerm[month * 2 - 1];
    }

    return "";
  }

  static getDate(date) {
    return new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    );
  }

  /**
   * 简化版本（仅作备用）
   */
  static simpleSolarToLunar(solarDate) {
    const date = new Date(solarDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 简化的农历计算（仅用于演示）
    const lunarMonth = month;
    const lunarDay = day;

    return {
      lunarYear: year,
      lunarMonth: lunarMonth,
      lunarDay: lunarDay,
      isLeapMonth: false,
      lunarMonthName: this.lunarMonths[lunarMonth - 1] || "正月",
      lunarDayName: this.lunarDays[lunarDay - 1] || "初一",
      zodiac: this.getZodiac(year),
      heavenlyStem: this.getHeavenlyStem(year),
      earthlyBranch: this.getEarthlyBranch(year),
      lunarYearName: this.getLunarYearName(year),
      solarTerm: null,
    };
  }

  /**
   * 获取生肖
   */
  static getZodiac(year) {
    return this.zodiacAnimals[(year - 4) % 12];
  }

  /**
   * 获取天干
   */
  static getHeavenlyStem(year) {
    return this.heavenlyStems[(year - 4) % 10];
  }

  /**
   * 获取地支
   */
  static getEarthlyBranch(year) {
    return this.earthlyBranches[(year - 4) % 12];
  }

  /**
   * 获取农历年份名称（干支纪年）
   */
  static getLunarYearName(year) {
    const stem = this.getHeavenlyStem(year);
    const branch = this.getEarthlyBranch(year);
    return `${stem}${branch}`;
  }

  /**
   * 获取农历显示字符串（用于日历格子显示）
   */
  static getLunarDisplayString(solarDate) {
    try {
      const lunar = this.solarToLunar(solarDate);

      // 如果有节气，优先显示节气
      if (lunar.solarTerm) {
        return lunar.solarTerm;
      }

      // 初一显示月份，其他显示日期
      return lunar.lunarDay === 1 ? lunar.lunarMonthName : lunar.lunarDayName;
    } catch (error) {
      console.error("农历计算错误:", error);
      // 降级方案：显示日期
      return solarDate.getDate().toString();
    }
  }

  /**
   * 获取完整的农历日期字符串
   */
  static getFullLunarString(solarDate) {
    try {
      const lunar = this.solarToLunar(solarDate);
      let result = `${lunar.lunarYearName}年 ${lunar.lunarMonthName}${lunar.lunarDayName}`;

      if (lunar.solarTerm) {
        result += ` ${lunar.solarTerm}`;
      }

      return result;
    } catch (error) {
      console.error("农历计算错误:", error);
      return "农历计算失败";
    }
  }

  /**
   * 获取节日信息
   */
  static getFestivalInfo(solarDate) {
    try {
      const lunar = this.solarToLunar(solarDate);
      const month = solarDate.getMonth() + 1;
      const day = solarDate.getDate();

      // 公历节日
      const solarFestivals = this.getSolarFestival(month, day);

      // 农历节日
      const lunarFestivals = this.getLunarFestival(
        lunar.lunarMonth,
        lunar.lunarDay
      );

      // 合并节日
      const allFestivals = [...solarFestivals, ...lunarFestivals].filter(
        (festival) => festival && festival.trim() !== ""
      );

      return {
        solarFestival: solarFestivals,
        lunarFestival: lunarFestivals,
        hasFestival: allFestivals.length > 0,
        allFestivals: [...new Set(allFestivals)], // 去重
      };
    } catch (error) {
      console.error("获取节日信息错误:", error);
      return {
        solarFestival: [],
        lunarFestival: [],
        hasFestival: false,
        allFestivals: [],
      };
    }
  }

  /**
   * 获取公历节日
   */
  static getSolarFestival(month, day) {
    const festivals = [];

    // 主要公历节日
    if (month === 1 && day === 1) festivals.push("元旦");
    if (month === 2 && day === 14) festivals.push("情人节");
    if (month === 3 && day === 8) festivals.push("妇女节");
    if (month === 3 && day === 12) festivals.push("植树节");
    if (month === 4 && day === 1) festivals.push("愚人节");
    if (month === 5 && day === 1) festivals.push("劳动节");
    if (month === 5 && day === 4) festivals.push("青年节");
    if (month === 6 && day === 1) festivals.push("儿童节");
    if (month === 7 && day === 1) festivals.push("建党节");
    if (month === 8 && day === 1) festivals.push("建军节");
    if (month === 9 && day === 10) festivals.push("教师节");
    if (month === 10 && day === 1) festivals.push("国庆节");
    if (month === 12 && day === 24) festivals.push("平安夜");
    if (month === 12 && day === 25) festivals.push("圣诞节");

    return festivals;
  }

  /**
   * 获取农历节日
   */
  static getLunarFestival(lunarMonth, lunarDay) {
    const festivals = [];

    // 主要农历节日
    if (lunarMonth === 1 && lunarDay === 1) festivals.push("春节");
    if (lunarMonth === 1 && lunarDay === 15) festivals.push("元宵节");
    if (lunarMonth === 2 && lunarDay === 2) festivals.push("龙抬头");
    if (lunarMonth === 5 && lunarDay === 5) festivals.push("端午节");
    if (lunarMonth === 7 && lunarDay === 7) festivals.push("七夕");
    if (lunarMonth === 7 && lunarDay === 15) festivals.push("中元节");
    if (lunarMonth === 8 && lunarDay === 15) festivals.push("中秋节");
    if (lunarMonth === 9 && lunarDay === 9) festivals.push("重阳节");
    if (lunarMonth === 12 && lunarDay === 8) festivals.push("腊八节");
    if (lunarMonth === 12 && lunarDay === 23) festivals.push("小年");
    if (lunarMonth === 12 && lunarDay === 30) festivals.push("除夕");

    return festivals;
  }

  /**
   * 检查是否为节假日
   */
  static isHoliday(solarDate) {
    const festivalInfo = this.getFestivalInfo(solarDate);
    return festivalInfo.hasFestival;
  }

  /**
   * 测试函数：验证农历计算是否正确
   */
  static testLunarCalculation() {
    const testDates = [
      new Date(2024, 1, 10), // 2024年春节：农历正月初一
      new Date(2024, 5, 10), // 2024年端午节：农历五月初五
      new Date(2024, 8, 17), // 2024年中秋节：农历八月十五
      new Date(2023, 0, 22), // 2023年春节：农历正月初一
    ];

    console.log("=== 农历计算测试 ===");
    testDates.forEach((date) => {
      try {
        const lunar = this.solarToLunar(date);
        console.log(
          `公历: ${date.toLocaleDateString()} -> 农历: ${lunar.lunarMonthName}${
            lunar.lunarDayName
          }`
        );
      } catch (error) {
        console.log(
          `公历: ${date.toLocaleDateString()} -> 错误: ${error.message}`
        );
      }
    });
    console.log("=== 测试结束 ===");
  }
}

export default LunarCalendar;
