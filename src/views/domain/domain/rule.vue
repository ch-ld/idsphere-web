<template>
  <div class="rule-describe">
    <table>
      <thead>
        <tr>
          <th>判断条件</th>
          <th>本地域名操作</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>服务商存在，本地存在</td>
          <td>更新本地域名信息（注册时间和过期时间）</td>
        </tr>
        <tr>
          <td>服务商存在，本地不存在</td>
          <td>同步至本地并与该服务商关联</td>
        </tr>
        <tr>
          <td>服务商不存在，本地存在</td>
          <td>删除（仅删除与此服务端有关联的）</td>
        </tr>
      </tbody>
    </table>
    <div class="note">
      <p><strong>注意：</strong></p>
      <ul>
        <li>目前域名同步、域名解析修改仅支持阿里云、华为云和腾讯云。</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RuleDescribe'
}
</script>

<style scoped>
.rule-describe {
  font-family: Arial, sans-serif;
  line-height: 1.6;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
  color: #333;
  font-weight: bold;
}

.note {
  margin-top: 20px;
  padding: 10px;
  border-left: 4px solid #3498db;
  background-color: #f0f9ff;
}

.note strong {
  color: #3498db;
}

code {
  font-family: monospace;
  background-color: #f4f4f4;
  padding: 2px 4px;
  border-radius: 4px;
}
</style>
