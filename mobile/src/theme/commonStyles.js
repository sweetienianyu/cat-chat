import { StyleSheet } from 'react-native'
import { colors, fontSize, radius, shadow, spacing, weights } from './tokens.js'

export const styles = StyleSheet.create({
  // ---------- 容器 ----------
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contentPad: {
    paddingHorizontal: 14,
    paddingBottom: 28,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  // ---------- 面板 / 卡片 ----------
  panel: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    ...shadow.sm,
    padding: 18,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.sm,
  },
  cardCover: {
    width: '100%',
    backgroundColor: '#f1f1f3',
  },
  cardTag: {
    position: 'absolute',
    left: 10,
    top: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  cardTagText: {
    color: colors.white,
    fontSize: 11,
  },
  cardBody: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 14,
  },
  cardTitle: {
    fontSize: fontSize.body,
    fontWeight: weights.bold,
    lineHeight: 20,
    color: colors.text1,
  },
  cardSub: {
    marginTop: 6,
    fontSize: fontSize.tiny,
    color: colors.text3,
  },
  cardFoot: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  cardAuthorText: {
    flex: 1,
    fontSize: fontSize.tiny,
    color: colors.text2,
  },

  // ---------- 小标签 ----------
  miniChip: {
    fontSize: 11,
    color: colors.text2,
    backgroundColor: '#f5f5f7',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  tag: {
    color: '#3a6ea5',
    backgroundColor: '#eef4fb',
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 4,
    fontSize: fontSize.small,
    overflow: 'hidden',
  },

  // ---------- Chip 筛选 ----------
  chip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipText: {
    fontSize: fontSize.small,
    color: colors.text2,
  },
  chipTextOn: {
    color: colors.white,
    fontWeight: weights.bold,
  },

  // ---------- 按钮 ----------
  btn: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#f3f3f5',
  },
  btnPrimary: {
    backgroundColor: colors.brand,
  },
  btnGhost: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  btnDanger: {
    backgroundColor: colors.brandSoft,
  },
  btnSm: {
    height: 32,
    paddingHorizontal: 12,
  },
  btnLg: {
    height: 46,
    paddingHorizontal: 26,
  },
  btnText: {
    fontSize: fontSize.body,
    fontWeight: weights.bold,
    color: colors.text1,
  },
  btnTextPrimary: {
    color: colors.white,
  },
  btnTextGhost: {
    color: colors.text2,
  },
  btnTextDanger: {
    color: colors.brand,
  },
  btnTextSm: {
    fontSize: fontSize.small,
  },
  btnTextLg: {
    fontSize: fontSize.title,
  },
  btnDisabled: {
    opacity: 0.55,
  },

  // ---------- 表单 ----------
  field: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: fontSize.small,
    fontWeight: weights.bold,
    color: colors.text2,
    marginBottom: spacing.sm,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e6e6e9',
    borderRadius: radius.md,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: fontSize.body,
    backgroundColor: colors.white,
    color: colors.text1,
  },
  textarea: {
    minHeight: 130,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  formHint: {
    fontSize: fontSize.tiny,
    color: colors.text3,
    marginTop: 6,
  },
  formError: {
    backgroundColor: colors.brandSoft,
    borderRadius: radius.md,
    paddingHorizontal: 13,
    paddingVertical: 10,
    fontSize: fontSize.small,
    color: colors.brand,
    marginBottom: spacing.lg,
  },
  tips: {
    backgroundColor: '#fff8e8',
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
  },
  tipsText: {
    fontSize: 12.5,
    color: '#8a6a1f',
    lineHeight: 22,
  },

  // ---------- 标题 ----------
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 30,
    marginBottom: spacing.lg,
  },
  sectionTitleBar: {
    width: 4,
    height: 16,
    borderRadius: 4,
    backgroundColor: colors.brand,
  },
  sectionTitleText: {
    fontSize: 17,
    fontWeight: weights.heavy,
    color: colors.text1,
  },
  detailTitle: {
    fontSize: fontSize.h1,
    lineHeight: 34,
    color: colors.text1,
    fontWeight: weights.bold,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: spacing.lg,
  },
  metaText: {
    fontSize: fontSize.small,
    color: colors.text3,
  },

  // ---------- 详情信息 ----------
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: spacing.lg,
  },
  infoCell: {
    width: '48%',
    backgroundColor: '#fafafb',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: fontSize.tiny,
    color: colors.text3,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: fontSize.body,
    fontWeight: weights.bold,
    color: colors.text1,
  },
  paragraph: {
    lineHeight: 26,
    color: colors.text2,
    fontSize: 15,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginVertical: 14,
  },

  // ---------- 空状态 / 骨架 ----------
  empty: {
    paddingVertical: 70,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 12,
  },
  emptyText: {
    color: colors.text3,
    fontSize: fontSize.body,
  },
  emptyHint: {
    color: colors.text3,
    fontSize: fontSize.small,
    marginTop: 6,
  },
  skeleton: {
    backgroundColor: '#ececef',
    borderRadius: radius.lg,
  },

  // ---------- 评论 ----------
  commentComposer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  commentComposerMain: {
    flex: 1,
    minWidth: 0,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  commentInput: {
    flex: 1,
    minWidth: 0,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: '#f4f4f6',
    paddingHorizontal: 16,
    fontSize: fontSize.body,
    color: colors.text1,
  },
  commentReplyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  commentReplyHintText: {
    fontSize: fontSize.tiny,
    color: colors.text3,
  },
  commentReplyCancel: {
    fontSize: fontSize.tiny,
    fontWeight: weights.bold,
    color: colors.brand,
  },
  commentList: {
    marginTop: 6,
  },
  comment: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  commentChild: {
    borderBottomWidth: 0,
    paddingVertical: 12,
  },
  commentBody: {
    flex: 1,
    minWidth: 0,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  commentAuthor: {
    fontSize: 13.5,
    fontWeight: weights.bold,
    color: colors.text1,
  },
  commentTime: {
    fontSize: 12.5,
    color: colors.text3,
  },
  commentContent: {
    marginTop: 5,
    fontSize: 14.5,
    lineHeight: 24,
    color: colors.text1,
  },
  commentActions: {
    marginTop: 6,
    flexDirection: 'row',
    gap: 14,
  },
  commentAction: {
    fontSize: 12.5,
    color: colors.text3,
  },
  commentActionDanger: {
    color: colors.brand,
  },
  commentReplies: {
    marginTop: spacing.md,
    backgroundColor: '#fafafb',
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  commentEmpty: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  // ---------- 操作栏 ----------
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 26,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 10,
  },
  actionItemText: {
    fontSize: fontSize.body,
    fontWeight: weights.bold,
    color: colors.text2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },

  // ---------- 页脚 ----------
  footer: {
    alignItems: 'center',
    paddingVertical: 26,
  },
  footerText: {
    fontSize: 12.5,
    color: colors.text3,
  },
})