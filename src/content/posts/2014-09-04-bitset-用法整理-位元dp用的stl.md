---
title: bitset 用法整理 (位元DP用的STL)
date: 2014-09-04
lastMod: 2014-09-04T00:00:00.000Z
summary: 'bitset 用法整理 include<bitset> 構造函數 bitset<n> b;  b有n位，每位都為0.參數n可以為一個表達式. 如bitset<5> b0;則"b0"為"00000"; bitset<n> bunsigned long u;  b有n位,並用u賦值;如果u超過n位,則頂端被截除 如:bitset<5>b05;則"b0"為"00101"; bitset<n> bstri...'
---

bitset 用法整理

#include<bitset>

構造函數

bitset<n> b;

b有n位，每位都為0.參數n可以為一個表達式.

如bitset<5> b0;則"b0"為"00000";

bitset<n> b(unsigned long u);

b有n位,並用u賦值;如果u超過n位,則頂端被截除

如:bitset<5>b0(5);則"b0"為"00101";

bitset<n> b(string s);

b是string對象s中含有的位串的副本

string bitval ( "10011" );

bitset<5> b0 ( bitval4 );

則"b0"為"10011";

bitset<n> b(s, pos);

b是s中從位置pos開始位的副本,前面的多餘位自動填充0;

string bitval ("01011010");

bitset<10> b0 ( bitval5, 3 );

則"b0" 為 "0000011010";

bitset<n> b(s, pos, num);

b是s中從位置pos開始的num個位的副本,如果num<n,則前面的空位自動填充0;

string bitval ("11110011011");

bitset<6> b0 ( bitval5, 3, 6 );

則"b0" 為 "100110";

os << b

把b中的位集輸出到os流

os >>b

輸入到b中,如"cin>>b",如果輸入的不是0或1的字符,只取該字符前面的二進制位.

bool any( )

是否存在置為1的二進制位？和none()相反

bool none( )

是否不存在置為1的二進制位,即全部為0？和any()相反.

size_t count( )

二進制位為1的個數.

size_t size( )

二進制位的個數

flip()

把所有二進制位逐位取反

flip(size_t pos)

把在pos處的二進制位取反

bool operator[]( size_type \_Pos )

獲取在pos處的二進制位

set()

把所有二進制位都置為1

set(pos)

把在pos處的二進制位置為1

reset()

把所有二進制位都置為0

reset(pos)

把在pos處的二進制位置為0

test(size_t pos)

在pos處的二進制位是否為1？

unsigned long to_ulong( )

用同樣的二進制位返回一個unsigned long值

string to_string ()

返回對應的字符串.

可以直接使用

!=, ==, &=, ^=, |=, ~, <<=, >>=, []等等運算子
