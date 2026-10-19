/**
 * GASS-KNUST Offline Academic & Computing Cheatsheets
 * Embedded local revision data available 100% offline without internet connection.
 */

export const OFFLINE_CHEATSHEETS = {
  r: {
    id: 'r',
    title: 'R & Tidyverse Reference Guide',
    badge: 'Offline QuickRef',
    subtitle: 'Core statistical computing, data wrangling, and plotting',
    sections: [
      {
        heading: 'Data Manipulation (dplyr)',
        snippets: [
          { label: 'Filter rows', code: 'library(dplyr)\ndf %>% filter(score > 70 & level == 200)' },
          { label: 'Select & Rename columns', code: 'df %>% select(student_id, gpa = cumulative_gpa)' },
          { label: 'Create new variables', code: 'df %>% mutate(standardized = (score - mean(score)) / sd(score))' },
          { label: 'Grouped Summary', code: 'df %>% group_by(department) %>% summarise(mean_val = mean(score), count = n())' }
        ]
      },
      {
        heading: 'Data Visualization (ggplot2)',
        snippets: [
          { label: 'Scatter plot & Regression line', code: 'library(ggplot2)\nggplot(df, aes(x = study_hours, y = exam_score)) +\n  geom_point(color = "#0B536F", alpha = 0.7) +\n  geom_smooth(method = "lm", color = "#E00613") +\n  theme_minimal()' },
          { label: 'Histogram with Density', code: 'ggplot(df, aes(x = score)) +\n  geom_histogram(aes(y = ..density..), fill = "#4A90E2", bins = 20) +\n  geom_density(color = "#0B536F", size = 1)' }
        ]
      },
      {
        heading: 'Statistical Hypothesis Testing',
        snippets: [
          { label: 'Independent Two-Sample t-test', code: 't.test(score ~ gender, data = df, var.equal = TRUE)' },
          { label: 'Linear Regression Modeling', code: 'model <- lm(exam_score ~ study_hours + attendance, data = df)\nsummary(model)\nconfint(model)' },
          { label: 'ANOVA & Post-Hoc Test', code: 'aov_res <- aov(score ~ level, data = df)\nsummary(aov_res)\nTukeyHSD(aov_res)' }
        ]
      }
    ]
  },

  python: {
    id: 'python',
    title: 'Python for Data Science & Statistics',
    badge: 'Offline QuickRef',
    subtitle: 'Pandas, NumPy, and statistical modeling reference',
    sections: [
      {
        heading: 'Data Analysis with Pandas',
        snippets: [
          { label: 'Load & inspect data', code: 'import pandas as pd\ndf = pd.read_csv("dataset.csv")\nprint(df.info())\nprint(df.describe())' },
          { label: 'Filter and query', code: 'high_performers = df[(df["score"] >= 80) & (df["level"] == 300)]' },
          { label: 'Aggregation and grouping', code: 'df.groupby("course_code").agg({"score": ["mean", "std", "count"]})' }
        ]
      },
      {
        heading: 'NumPy Vectorized Operations',
        snippets: [
          { label: 'Array statistics', code: 'import numpy as np\narr = np.array([12, 15, 18, 22, 25])\nmean = np.mean(arr)\nstd_dev = np.std(arr, ddof=1)  # Sample standard deviation' }
        ]
      },
      {
        heading: 'Machine Learning (Scikit-Learn)',
        snippets: [
          { label: 'Linear Regression model', code: 'from sklearn.linear_model import LinearRegression\nfrom sklearn.model_selection import train_test_split\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\nreg = LinearRegression().fit(X_train, y_train)\nprint(f"R² Score: {reg.score(X_test, y_test):.4f}")' }
        ]
      }
    ]
  },

  sql: {
    id: 'sql',
    title: 'SQL for Statisticians & Analysts',
    badge: 'Offline QuickRef',
    subtitle: 'Query patterns, joins, grouping, and analytical window functions',
    sections: [
      {
        heading: 'Aggregation & Filtering',
        snippets: [
          { label: 'Grouped statistics with HAVING', code: 'SELECT \n    level,\n    ROUND(AVG(score), 2) AS mean_score,\n    COUNT(*) AS total_students\nFROM student_records\nWHERE semester = 1\nGROUP BY level\nHAVING COUNT(*) > 10\nORDER BY mean_score DESC;' }
        ]
      },
      {
        heading: 'Relational Joins',
        snippets: [
          { label: 'Inner and Left Joins', code: 'SELECT s.name, c.code, e.grade\nFROM students s\nJOIN enrollments e ON s.id = e.student_id\nJOIN courses c ON e.course_id = c.id\nWHERE c.level = 200;' }
        ]
      },
      {
        heading: 'Window Functions (Advanced Analytics)',
        snippets: [
          { label: 'Ranking within groups', code: 'SELECT \n    student_id, course_code, score,\n    RANK() OVER (PARTITION BY course_code ORDER BY score DESC) as rank_in_course\nFROM exam_results;' }
        ]
      }
    ]
  },

  latex: {
    id: 'latex',
    title: 'LaTeX Academic Typesetting',
    badge: 'Offline QuickRef',
    subtitle: 'Mathematical notation, Greek symbols, matrices, and tables',
    sections: [
      {
        heading: 'Core Math Syntax',
        snippets: [
          { label: 'Fractions & Sums', code: '\\[ \\bar{X} = \\frac{1}{n} \\sum_{i=1}^{n} X_i \\]' },
          { label: 'Sample Variance Formula', code: '\\[ S^2 = \\frac{1}{n-1} \\sum_{i=1}^{n} (X_i - \\bar{X})^2 \\]' },
          { label: 'Normal Distribution PDF', code: '\\[ f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} \\exp\\left( -\\frac{(x-\\mu)^2}{2\\sigma^2} \\right) \\]' }
        ]
      },
      {
        heading: 'Greek Letters commonly used in Statistics',
        snippets: [
          { label: 'Parameters & Tests', code: '\\alpha (significance), \\beta (Type II error), \\mu (mean),\n\\sigma (std dev), \\chi^2 (chi-square), \\lambda (Poisson rate)' }
        ]
      }
    ]
  },

  statistics: {
    id: 'statistics',
    title: 'Core Statistical Formulas Cheatsheet',
    badge: 'Offline QuickRef',
    subtitle: 'Essential formulas for probability distributions, inference, and tests',
    sections: [
      {
        heading: 'Descriptive Statistics & Probability',
        snippets: [
          { label: 'Expected Value & Variance', code: 'E[X] = Σ x * P(X = x)\nVar(X) = E[X²] - (E[X])²' },
          { label: 'Standard Normal Z-score', code: 'Z = (X - μ) / σ' },
          { label: 'Central Limit Theorem (CLT)', code: 'For sample size n ≥ 30:\nX̄ ~ N(μ, σ² / n)\nZ = (X̄ - μ) / (σ / √n)' }
        ]
      },
      {
        heading: 'Statistical Inference & Confidence Intervals',
        snippets: [
          { label: 'CI for Mean (σ known)', code: 'CI = x̄ ± Z_(α/2) * (σ / √n)\n(95% Z = 1.96, 99% Z = 2.576)' },
          { label: 'CI for Mean (σ unknown, t-distribution)', code: 'CI = x̄ ± t_(α/2, n-1) * (s / √n)' },
          { label: 'Independent Samples t-statistic', code: 't = (x̄₁ - x̄₂) / √( s_p² (1/n₁ + 1/n₂) )\ns_p² = ((n₁-1)s₁² + (n₂-1)s₂²) / (n₁ + n₂ - 2)' }
        ]
      }
    ]
  },

  excel: {
    id: 'excel',
    title: 'Excel & Power BI Functions for Statisticians',
    badge: 'Offline QuickRef',
    subtitle: 'Spreadsheet formulas for data summarization and hypothesis testing',
    sections: [
      {
        heading: 'Statistical Formulas in Excel',
        snippets: [
          { label: 'Mean & Standard Deviation', code: '=AVERAGE(A2:A100)\n=STDEV.S(A2:A100)   -- Sample standard deviation\n=VAR.S(A2:A100)     -- Sample variance' },
          { label: 'Lookup & Search', code: '=XLOOKUP(lookup_value, lookup_array, return_array, "Not Found")\n=INDEX(return_range, MATCH(lookup_val, lookup_range, 0))' },
          { label: 'Conditional Aggregates', code: '=COUNTIF(B2:B100, ">=70")\n=AVERAGEIFS(C2:C100, A2:A100, 200, B2:B100, ">=50")' }
        ]
      }
    ]
  }
};

/**
 * Matches a resource to an offline cheatsheet by title, tags, or category.
 */
export function getOfflineCheatsheetForResource(resource) {
  if (!resource) return null;

  const haystack = `${resource.title || ''} ${resource.description || ''} ${resource.beyond_category || ''} ${resource.beyond_sub_topic || ''} ${resource.tags?.join(' ') || ''}`.toLowerCase();

  if (haystack.includes(' r ') || haystack.includes('tidyverse') || haystack.includes('r for data science')) {
    return OFFLINE_CHEATSHEETS.r;
  }
  if (haystack.includes('python') || haystack.includes('pandas') || haystack.includes('scikit')) {
    return OFFLINE_CHEATSHEETS.python;
  }
  if (haystack.includes('sql') || haystack.includes('database')) {
    return OFFLINE_CHEATSHEETS.sql;
  }
  if (haystack.includes('latex') || haystack.includes('thesis') || haystack.includes('typeset')) {
    return OFFLINE_CHEATSHEETS.latex;
  }
  if (haystack.includes('excel') || haystack.includes('power bi') || haystack.includes('spreadsheet')) {
    return OFFLINE_CHEATSHEETS.excel;
  }
  if (haystack.includes('stat') || haystack.includes('model') || haystack.includes('regression') || haystack.includes('probability')) {
    return OFFLINE_CHEATSHEETS.statistics;
  }

  return OFFLINE_CHEATSHEETS.statistics; // default fallback for any statistics resource
}
