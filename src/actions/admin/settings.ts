'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { UserRole } from "@prisma/client";
import { canPerform } from "@/lib/auth/permissions";

/**
 * METADATA MAPPING
 */
const SETTING_METADATA: Record<string, { group: string, type: string }> = {
    // --- 1. BRAND & CONTACT ---
    site_name:     { group: 'BRANDING', type: 'STRING' },
    site_logo:     { group: 'BRANDING', type: 'IMAGE' },
    contact_email: { group: 'CONTACT', type: 'STRING' },
    contact_phone: { group: 'CONTACT', type: 'STRING' },
    address_main:  { group: 'CONTACT', type: 'STRING' },

    auth_login_limit: { group: 'SECURITY', type: 'NUMBER' },

    // --- 2. GLOBAL SETTINGS ---
    announcement_active:        { group: 'GLOBAL', type: 'BOOLEAN' },
    announcement_text:          { group: 'GLOBAL', type: 'STRING' },
    announcement_contact_phone: { group: 'GLOBAL', type: 'STRING' },

    // --- 3. NAV BAR ---
    nav_structure_json: { group: 'NAV', type: 'JSON' },
    // Nav Promos
    nav_bank_title:     { group: 'NAV', type: 'STRING' },
    nav_bank_desc:      { group: 'NAV', type: 'STRING' },
    nav_borrow_title:   { group: 'NAV', type: 'STRING' },
    nav_borrow_desc:    { group: 'NAV', type: 'STRING' },
    nav_wealth_title:   { group: 'NAV', type: 'STRING' },
    nav_wealth_desc:    { group: 'NAV', type: 'STRING' },
    nav_insure_title:   { group: 'NAV', type: 'STRING' },
    nav_insure_desc:    { group: 'NAV', type: 'STRING' },
    nav_learn_title:    { group: 'NAV', type: 'STRING' },
    nav_learn_desc:     { group: 'NAV', type: 'STRING' },

    // --- 4. HOME PAGE HERO ---
    hero_badge:    { group: 'HOME', type: 'STRING' },
    home_hero_img: { group: 'HOME', type: 'IMAGE' },
    home_hero_alt: { group: 'HOME', type: 'STRING' },
    hero_title:    { group: 'HOME', type: 'STRING' },
    hero_subtitle: { group: 'HOME', type: 'STRING' },
    hero_cta_text: { group: 'HOME', type: 'STRING' },

    // --- 5. HOME SECTIONS ---
    // Rates Section on Home
    home_rates_title: { group: 'HOME', type: 'STRING' },
    home_rates_desc:  { group: 'HOME', type: 'STRING' },

    // Card
    home_card_img:         { group: 'HOME', type: 'IMAGE' },
    home_card_alt:         { group: 'HOME', type: 'STRING' },
    home_card_series:      { group: 'HOME', type: 'STRING' },
    home_card_title:       { group: 'HOME', type: 'STRING' },
    home_card_highlight:   { group: 'HOME', type: 'STRING' },
    home_card_desc:        { group: 'HOME', type: 'STRING' },
    home_card_feat_1:      { group: 'HOME', type: 'STRING' },
    home_card_feat_1_desc: { group: 'HOME', type: 'STRING' },
    home_card_feat_2:      { group: 'HOME', type: 'STRING' },
    home_card_feat_2_desc: { group: 'HOME', type: 'STRING' },
    home_card_feat_3:      { group: 'HOME', type: 'STRING' },
    home_card_feat_3_desc: { group: 'HOME', type: 'STRING' },

    // Guide
    home_guide_title:      { group: 'HOME', type: 'STRING' },
    home_guide_desc:       { group: 'HOME', type: 'STRING' },
    guide_article_1_title: { group: 'HOME', type: 'STRING' },
    guide_article_1_img:   { group: 'HOME', type: 'IMAGE' },
    guide_article_1_alt:   { group: 'HOME', type: 'STRING' },
    guide_article_2_title: { group: 'HOME', type: 'STRING' },
    guide_article_3_title: { group: 'HOME', type: 'STRING' },
    guide_article_3_img:   { group: 'HOME', type: 'IMAGE' },
    guide_article_3_alt:   { group: 'HOME', type: 'STRING' },
    guide_article_4_title: { group: 'HOME', type: 'STRING' },
    guide_article_4_img:   { group: 'HOME', type: 'IMAGE' },
    guide_article_4_alt:   { group: 'HOME', type: 'STRING' },

    // Investment
    home_invest_title:      { group: 'HOME', type: 'STRING' },
    home_invest_highlight:  { group: 'HOME', type: 'STRING' },
    home_invest_desc:       { group: 'HOME', type: 'STRING' },
    home_invest_img:        { group: 'HOME', type: 'IMAGE' },
    home_invest_alt:        { group: 'HOME', type: 'STRING' },
    home_invest_feat1:      { group: 'HOME', type: 'STRING' },
    home_invest_feat1_desc: { group: 'HOME', type: 'STRING' },
    home_invest_feat2:      { group: 'HOME', type: 'STRING' },
    home_invest_feat2_desc: { group: 'HOME', type: 'STRING' },
    home_invest_feat3:      { group: 'HOME', type: 'STRING' },
    home_invest_feat3_desc: { group: 'HOME', type: 'STRING' },

    // Loan
    home_loan_title:       { group: 'HOME', type: 'STRING' },
    home_loan_desc:        { group: 'HOME', type: 'STRING' },
    home_loan_card1_title: { group: 'HOME', type: 'STRING' },
    home_loan_card1_desc:  { group: 'HOME', type: 'STRING' },
    home_loan_card1_img:   { group: 'HOME', type: 'IMAGE' },
    home_loan_card1_alt:   { group: 'HOME', type: 'STRING' },
    home_loan_card2_title: { group: 'HOME', type: 'STRING' },
    home_loan_card2_desc:  { group: 'HOME', type: 'STRING' },
    home_loan_card2_img:   { group: 'HOME', type: 'IMAGE' },
    home_loan_card2_alt:   { group: 'HOME', type: 'STRING' },

    // Globe
    home_global_title:     { group: 'HOME', type: 'STRING' },
    home_global_highlight: { group: 'HOME', type: 'STRING' },
    home_global_desc:      { group: 'HOME', type: 'STRING' },
    home_global_img:       { group: 'HOME', type: 'IMAGE' },
    home_global_alt:       { group: 'HOME', type: 'STRING' },
    global_stat_countries: { group: 'HOME', type: 'STRING' },
    global_stat_digital:   { group: 'HOME', type: 'STRING' },
    global_stat_fraud:     { group: 'HOME', type: 'STRING' },

    // Partners
    home_partner_label: { group: 'HOME', type: 'STRING' },
    partner_img_1:      { group: 'HOME', type: 'IMAGE' },
    partner_img_2:      { group: 'HOME', type: 'IMAGE' },
    partner_img_3:      { group: 'HOME', type: 'IMAGE' },
    partner_img_4:      { group: 'HOME', type: 'IMAGE' },
    partner_img_5:      { group: 'HOME', type: 'IMAGE' },
    partner_img_6:      { group: 'HOME', type: 'IMAGE' },

    // Final CTA
    home_cta_img:       { group: 'HOME', type: 'IMAGE' },
    home_cta_alt:       { group: 'HOME', type: 'STRING' },
    home_cta_title:     { group: 'HOME', type: 'STRING' },
    home_cta_desc:      { group: 'HOME', type: 'STRING' },
    home_cta_benefit_1: { group: 'HOME', type: 'STRING' },
    home_cta_benefit_2: { group: 'HOME', type: 'STRING' },
    home_cta_benefit_3: { group: 'HOME', type: 'STRING' },

      // --- 6. GLOBAL RATES & PRODUCT SPECS ---
    rate_hysa_apy:         { group: 'RATES', type: 'STRING' },
    rate_cd_apy:           { group: 'RATES', type: 'STRING' },
    rate_mma_apy:          { group: 'RATES', type: 'STRING' },
    rate_kids_apy:         { group: 'RATES', type: 'STRING' },
    rate_business_apy:     { group: 'RATES', type: 'STRING' },
    rate_ira_apy:          { group: 'RATES', type: 'STRING' },
    rate_auto_low:         { group: 'RATES', type: 'STRING' },
    rate_credit_intro_apr: { group: 'RATES', type: 'STRING' },
    rate_checking_bonus:   { group: 'RATES', type: 'STRING' },

    // --- 6. PRODUCT PAGES ---
    // BANK
    bank_hero_img:           { group: 'BANKING', type: 'IMAGE' },
    bank_hero_alt:           { group: 'BANKING', type: 'STRING' },
    bank_hero_title_1:       { group: 'BANKING', type: 'STRING' },
    bank_hero_highlight:     { group: 'BANKING', type: 'STRING' },
    bank_hero_desc:          { group: 'BANKING', type: 'STRING' },
    bank_card_badge:         { group: 'BANKING', type: 'STRING' },
    bank_card_title:         { group: 'BANKING', type: 'STRING' },
    bank_card_desc:          { group: 'BANKING', type: 'STRING' },
    bank_feat_1_title:       { group: 'BANKING', type: 'STRING' },
    bank_feat_1_desc:        { group: 'BANKING', type: 'STRING' },
    bank_feat_2_title:       { group: 'BANKING', type: 'STRING' },
    bank_feat_2_desc:        { group: 'BANKING', type: 'STRING' },
    bank_feat_3_title:       { group: 'BANKING', type: 'STRING' },
    bank_feat_3_desc:        { group: 'BANKING', type: 'STRING' },
    bank_compare_title:      { group: 'BANKING', type: 'STRING' },
    bank_compare_desc:       { group: 'BANKING', type: 'STRING' },
    bank_fee_monthly:        { group: 'BANKING', type: 'STRING' },
    bank_fee_overdraft:      { group: 'BANKING', type: 'STRING' },
    bank_fee_foreign:        { group: 'BANKING', type: 'STRING' },
    bank_min_balance:        { group: 'BANKING', type: 'STRING' },
    competitor_fee_monthly:  { group: 'BANKING', type: 'STRING' },
    competitor_fee_overdraft:{ group: 'BANKING', type: 'STRING' },
    competitor_fee_foreign:  { group: 'BANKING', type: 'STRING' },
    competitor_min_balance:  { group: 'BANKING', type: 'STRING' },
    bank_card_feat_1:        { group: 'BANKING', type: 'STRING' },
    bank_card_feat_2:        { group: 'BANKING', type: 'STRING' },
    bank_card_feat_3:        { group: 'BANKING', type: 'STRING' },
    bank_tbl_row_1_label:    { group: 'BANKING', type: 'STRING' },
    bank_tbl_row_2_label:    { group: 'BANKING', type: 'STRING' },
    bank_tbl_row_3_label:    { group: 'BANKING', type: 'STRING' },
    bank_tbl_row_4_label:    { group: 'BANKING', type: 'STRING' },
    bank_tbl_row_5_label:    { group: 'BANKING', type: 'STRING' },
    bank_cs_title:           { group: 'BANKING', type: 'STRING' },
    bank_cs_desc:            { group: 'BANKING', type: 'STRING' },
    bank_cs_btn:             { group: 'BANKING', type: 'STRING' },
    bank_cs_img:             { group: 'BANKING', type: 'IMAGE' },
    bank_cs_img_alt:         { group: 'BANKING', type: 'STRING' },
    bank_biz_title:          { group: 'BANKING', type: 'STRING' },
    bank_biz_desc:           { group: 'BANKING', type: 'STRING' },
    bank_biz_btn:            { group: 'BANKING', type: 'STRING' },
    bank_biz_img:            { group: 'BANKING', type: 'IMAGE' },
    bank_biz_img_alt:        { group: 'BANKING', type: 'STRING' },
    bank_stu_title:          { group: 'BANKING', type: 'STRING' },
    bank_stu_desc:           { group: 'BANKING', type: 'STRING' },
    bank_stu_btn:            { group: 'BANKING', type: 'STRING' },
    bank_stu_img:            { group: 'BANKING', type: 'IMAGE' },
    bank_stu_img_alt:        { group: 'BANKING', type: 'STRING' },
    bank_hero_btn_primary:   { group: 'BANKING', type: 'STRING' },
    bank_hero_btn_secondary: { group: 'BANKING', type: 'STRING' },
    bank_compare_col_1:      { group: 'BANKING', type: 'STRING' },
    bank_compare_col_2:      { group: 'BANKING', type: 'STRING' },

    // SAVE
    save_hero_title:       { group: 'SAVE', type: 'STRING' },
    save_hero_highlight:   { group: 'SAVE', type: 'STRING' },
    save_hero_desc:        { group: 'SAVE', type: 'STRING' },
    save_hero_img:         { group: 'SAVE', type: 'IMAGE' },
    save_hero_alt:         { group: 'SAVE', type: 'STRING' },
    save_trust_title:      { group: 'SAVE', type: 'STRING' },
    save_trust_desc:       { group: 'SAVE', type: 'STRING' },
    save_prod_title:       { group: 'SAVE', type: 'STRING' },
    save_prod_subtitle:    { group: 'SAVE', type: 'STRING' },
    save_prod1_title:      { group: 'SAVE', type: 'STRING' },
    save_prod1_desc:       { group: 'SAVE', type: 'STRING' },
    save_prod1_link:       { group: 'SAVE', type: 'STRING' },
    save_prod2_title:      { group: 'SAVE', type: 'STRING' },
    save_prod2_desc:       { group: 'SAVE', type: 'STRING' },
    save_prod2_link:       { group: 'SAVE', type: 'STRING' },
    save_prod3_title:      { group: 'SAVE', type: 'STRING' },
    save_prod3_desc:       { group: 'SAVE', type: 'STRING' },
    save_prod3_link:       { group: 'SAVE', type: 'STRING' },
    save_prod4_title:      { group: 'SAVE', type: 'STRING' },
    save_prod4_desc:       { group: 'SAVE', type: 'STRING' },
    save_prod4_link:       { group: 'SAVE', type: 'STRING' },
    save_prod5_title:      { group: 'SAVE', type: 'STRING' },
    save_prod5_desc:       { group: 'SAVE', type: 'STRING' },
    save_prod5_link:       { group: 'SAVE', type: 'STRING' },
    save_prod6_title:      { group: 'SAVE', type: 'STRING' },
    save_prod6_desc:       { group: 'SAVE', type: 'STRING' },
    save_prod6_link:       { group: 'SAVE', type: 'STRING' },
    save_fdic_badge:       { group: 'SAVE', type: 'STRING' },
    save_calc_title:       { group: 'SAVE', type: 'STRING' },
    save_calc_desc_prefix: { group: 'SAVE', type: 'STRING' },
    save_calc_cta:         { group: 'SAVE', type: 'STRING' },
    save_trust_badge_1:    { group: 'SAVE', type: 'STRING' },
    save_trust_badge_2:    { group: 'SAVE', type: 'STRING' },
    save_cds_title:        { group: 'SAVE', type: 'STRING' },
    save_cds_desc:         { group: 'SAVE', type: 'STRING' },
    save_cds_img:          { group: 'SAVE', type: 'IMAGE' },
    save_cds_img_alt:      { group: 'SAVE', type: 'STRING' },
    save_mma_title:        { group: 'SAVE', type: 'STRING' },
    save_mma_desc:         { group: 'SAVE', type: 'STRING' },
    save_mma_btn:          { group: 'SAVE', type: 'STRING' },
    save_mma_img:          { group: 'SAVE', type: 'IMAGE' },
    save_mma_img_alt:      { group: 'SAVE', type: 'STRING' },
    save_kids_title:       { group: 'SAVE', type: 'STRING' },
    save_kids_desc:        { group: 'SAVE', type: 'STRING' },
    save_kids_btn:         { group: 'SAVE', type: 'STRING' },
    save_kids_img:         { group: 'SAVE', type: 'IMAGE' },
    save_kids_img_alt:     { group: 'SAVE', type: 'STRING' },

    // BORROW
    borrow_hero_title:       { group: 'BORROW', type: 'STRING' },
    borrow_hero_highlight:   { group: 'BORROW', type: 'STRING' },
    borrow_hero_desc:        { group: 'BORROW', type: 'STRING' },
    borrow_hero_img:         { group: 'BORROW', type: 'IMAGE' },
    borrow_hero_alt:         { group: 'BORROW', type: 'STRING' },
    borrow_stat_funded:      { group: 'BORROW', type: 'STRING' },
    borrow_stat_speed:       { group: 'BORROW', type: 'STRING' },
    borrow_stat_approval:    { group: 'BORROW', type: 'STRING' },
    borrow_trust1_title:     { group: 'BORROW', type: 'STRING' },
    borrow_trust1_desc:      { group: 'BORROW', type: 'STRING' },
    borrow_trust2_title:     { group: 'BORROW', type: 'STRING' },
    borrow_trust2_desc:      { group: 'BORROW', type: 'STRING' },
    borrow_prod1_title:      { group: 'BORROW', type: 'STRING' },
    borrow_prod1_desc:       { group: 'BORROW', type: 'STRING' },
    borrow_prod2_title:      { group: 'BORROW', type: 'STRING' },
    borrow_prod2_desc:       { group: 'BORROW', type: 'STRING' },
    borrow_prod3_title:      { group: 'BORROW', type: 'STRING' },
    borrow_prod3_desc:       { group: 'BORROW', type: 'STRING' },
    borrow_prod4_title:      { group: 'BORROW', type: 'STRING' },
    borrow_prod4_desc:       { group: 'BORROW', type: 'STRING' },
    borrow_prod5_title:      { group: 'BORROW', type: 'STRING' },
    borrow_prod5_desc:       { group: 'BORROW', type: 'STRING' },
    borrow_prod6_title:      { group: 'BORROW', type: 'STRING' },
    borrow_prod6_desc:       { group: 'BORROW', type: 'STRING' },
    rate_personal_apr:       { group: 'BORROW', type: 'STRING' },
    rate_auto_apr:           { group: 'BORROW', type: 'STRING' },
    rate_mortgage_label:     { group: 'BORROW', type: 'STRING' },
    rate_student_label:      { group: 'BORROW', type: 'STRING' },
    rate_home_equity_label:  { group: 'BORROW', type: 'STRING' },
    borrow_calc_title:       { group: 'BORROW', type: 'STRING' },
    borrow_calc_desc:        { group: 'BORROW', type: 'STRING' },
    borrow_calc_label_amt:   { group: 'BORROW', type: 'STRING' },
    borrow_calc_label_term:  { group: 'BORROW', type: 'STRING' },
    borrow_calc_label_rate:  { group: 'BORROW', type: 'STRING' },
    borrow_calc_res_monthly: { group: 'BORROW', type: 'STRING' },
    borrow_calc_res_total:   { group: 'BORROW', type: 'STRING' },
    borrow_calc_cta:         { group: 'BORROW', type: 'STRING' },
    borrow_cc_title:         { group: 'BORROW', type: 'STRING' },
    borrow_cc_desc:          { group: 'BORROW', type: 'STRING' },
    borrow_cc_btn:           { group: 'BORROW', type: 'STRING' },
    borrow_cc_img:           { group: 'BORROW', type: 'IMAGE' },
    borrow_cc_img_alt:       { group: 'BORROW', type: 'STRING' },
    borrow_calc_label_princ: { group: 'BORROW', type: 'STRING' },
    borrow_calc_label_int:   { group: 'BORROW', type: 'STRING' },
    borrow_prod_btn_text:    { group: 'BORROW', type: 'STRING' },
    borrow_pl_title:         { group: 'BORROW', type: 'STRING' },
    borrow_pl_desc:          { group: 'BORROW', type: 'STRING' },
    borrow_pl_btn:           { group: 'BORROW', type: 'STRING' },
    borrow_pl_img:           { group: 'BORROW', type: 'IMAGE' },
    borrow_pl_img_alt:       { group: 'BORROW', type: 'STRING' },
    borrow_mt_title:         { group: 'BORROW', type: 'STRING' },
    borrow_mt_desc:          { group: 'BORROW', type: 'STRING' },
    borrow_mt_btn:           { group: 'BORROW', type: 'STRING' },
    borrow_mt_img:           { group: 'BORROW', type: 'IMAGE' },
    borrow_mt_img_alt:       { group: 'BORROW', type: 'STRING' },
    borrow_al_title:         { group: 'BORROW', type: 'STRING' },
    borrow_al_desc:          { group: 'BORROW', type: 'STRING' },
    borrow_al_btn:           { group: 'BORROW', type: 'STRING' },
    borrow_al_img:           { group: 'BORROW', type: 'IMAGE' },
    borrow_al_img_alt:       { group: 'BORROW', type: 'STRING' },
    borrow_sl_title:         { group: 'BORROW', type: 'STRING' },
    borrow_sl_desc:          { group: 'BORROW', type: 'STRING' },
    borrow_sl_btn:           { group: 'BORROW', type: 'STRING' },
    borrow_sl_img:           { group: 'BORROW', type: 'IMAGE' },
    borrow_sl_img_alt:       { group: 'BORROW', type: 'STRING' },
    borrow_he_title:         { group: 'BORROW', type: 'STRING' },
    borrow_he_desc:          { group: 'BORROW', type: 'STRING' },
    borrow_he_btn:           { group: 'BORROW', type: 'STRING' },
    borrow_he_img:           { group: 'BORROW', type: 'IMAGE' },
    borrow_he_alt:           { group: 'BORROW', type: 'STRING' },

    // WEALTH
    wealth_hero_title:           { group: 'WEALTH', type: 'STRING' },
    wealth_hero_highlight:       { group: 'WEALTH', type: 'STRING' },
    wealth_hero_desc:            { group: 'WEALTH', type: 'STRING' },
    wealth_hero_img:             { group: 'WEALTH', type: 'IMAGE' },
    wealth_hero_alt:             { group: 'WEALTH', type: 'STRING' },
    wealth_service1_title:       { group: 'WEALTH', type: 'STRING' },
    wealth_service1_desc:        { group: 'WEALTH', type: 'STRING' },
    wealth_service2_title:       { group: 'WEALTH', type: 'STRING' },
    wealth_service2_desc:        { group: 'WEALTH', type: 'STRING' },
    wealth_service3_title:       { group: 'WEALTH', type: 'STRING' },
    wealth_service3_desc:        { group: 'WEALTH', type: 'STRING' },
    wealth_advisor_title:        { group: 'WEALTH', type: 'STRING' },
    wealth_advisor_desc:         { group: 'WEALTH', type: 'STRING' },
    wealth_hero_badge:           { group: 'WEALTH', type: 'STRING' },
    wealth_grid_title:           { group: 'WEALTH', type: 'STRING' },
    wealth_grid_desc:            { group: 'WEALTH', type: 'STRING' },
    wealth_service1_btn:         { group: 'WEALTH', type: 'STRING' },
    wealth_service2_btn:         { group: 'WEALTH', type: 'STRING' },
    wealth_service3_btn:         { group: 'WEALTH', type: 'STRING' },
    wealth_adv_item1:            { group: 'WEALTH', type: 'STRING' },
    wealth_adv_item2:            { group: 'WEALTH', type: 'STRING' },
    wealth_adv_item3:            { group: 'WEALTH', type: 'STRING' },
    wealth_adv_btn:              { group: 'WEALTH', type: 'STRING' },
    wealth_sim_title:            { group: 'WEALTH', type: 'STRING' },
    wealth_sim_desc:             { group: 'WEALTH', type: 'STRING' },
    wealth_sim_risk_label:       { group: 'WEALTH', type: 'STRING' },
    wealth_sim_return_label:     { group: 'WEALTH', type: 'STRING' },
    wealth_sim_note:             { group: 'WEALTH', type: 'STRING' },
    wealth_sim_label_volatility: { group: 'WEALTH', type: 'STRING' },
    wealth_sim_label_allocation: { group: 'WEALTH', type: 'STRING' },
    wealth_sim_legend_stocks:    { group: 'WEALTH', type: 'STRING' },
    wealth_sim_legend_crypto:    { group: 'WEALTH', type: 'STRING' },
    wealth_sim_legend_real:      { group: 'WEALTH', type: 'STRING' },
    wealth_sim_legend_bonds:     { group: 'WEALTH', type: 'STRING' },
    wealth_pcg_title:            { group: 'WEALTH', type: 'STRING' },
    wealth_pcg_desc:             { group: 'WEALTH', type: 'STRING' },
    wealth_pcg_btn:              { group: 'WEALTH', type: 'STRING' },
    wealth_pcg_img:              { group: 'WEALTH', type: 'IMAGE' },
    wealth_pcg_img_alt:          { group: 'WEALTH', type: 'STRING' },
    wealth_ret_title:            { group: 'WEALTH', type: 'STRING' },
    wealth_ret_desc:             { group: 'WEALTH', type: 'STRING' },
    wealth_ret_btn:              { group: 'WEALTH', type: 'STRING' },
    wealth_ret_img:              { group: 'WEALTH', type: 'IMAGE' },
    wealth_ret_img_alt:          { group: 'WEALTH', type: 'STRING' },
    wealth_est_title:            { group: 'WEALTH', type: 'STRING' },
    wealth_est_desc:             { group: 'WEALTH', type: 'STRING' },
    wealth_est_btn:              { group: 'WEALTH', type: 'STRING' },
    wealth_est_img:              { group: 'WEALTH', type: 'IMAGE' },
    wealth_est_img_alt:          { group: 'WEALTH', type: 'STRING' },

    // INSURE
    insure_hero_badge:     { group: 'INSURE', type: 'STRING' },
    insure_hero_title:     { group: 'INSURE', type: 'STRING' },
    insure_hero_highlight: { group: 'INSURE', type: 'STRING' },
    insure_hero_desc:      { group: 'INSURE', type: 'STRING' },
    insure_hero_img:       { group: 'INSURE', type: 'IMAGE' },
    insure_hero_alt:       { group: 'INSURE', type: 'STRING' },
    insure_products_title: { group: 'INSURE', type: 'STRING' },
    insure_products_desc:  { group: 'INSURE', type: 'STRING' },
    insure_prod1_title:    { group: 'INSURE', type: 'STRING' },
    insure_prod1_desc:     { group: 'INSURE', type: 'STRING' },
    insure_prod2_title:    { group: 'INSURE', type: 'STRING' },
    insure_prod2_desc:     { group: 'INSURE', type: 'STRING' },
    insure_prod3_title:    { group: 'INSURE', type: 'STRING' },
    insure_prod3_desc:     { group: 'INSURE', type: 'STRING' },
    insure_prod4_title:    { group: 'INSURE', type: 'STRING' },
    insure_prod4_desc:     { group: 'INSURE', type: 'STRING' },
    insure_prod5_title:    { group: 'INSURE', type: 'STRING' },
    insure_prod5_desc:     { group: 'INSURE', type: 'STRING' },
    insure_prod6_title:    { group: 'INSURE', type: 'STRING' },
    insure_prod6_desc:     { group: 'INSURE', type: 'STRING' },
    insure_partners_title: { group: 'INSURE', type: 'STRING' },
    insure_partner1_img:   { group: 'INSURE', type: 'IMAGE' },
    insure_partner2_img:   { group: 'INSURE', type: 'IMAGE' },
    insure_partner3_img:   { group: 'INSURE', type: 'IMAGE' },
    insure_partner4_img:   { group: 'INSURE', type: 'IMAGE' },
    insure_prod1_img:      { group: 'INSURE', type: 'IMAGE' },
    insure_prod1_img_alt:  { group: 'INSURE', type: 'STRING' },
    insure_prod1_btn:      { group: 'INSURE', type: 'STRING' },
    insure_prod2_img:      { group: 'INSURE', type: 'IMAGE' },
    insure_prod2_img_alt:  { group: 'INSURE', type: 'STRING' },
    insure_prod2_btn:      { group: 'INSURE', type: 'STRING' },
    insure_prod3_img:      { group: 'INSURE', type: 'IMAGE' },
    insure_prod3_img_alt:  { group: 'INSURE', type: 'STRING' },
    insure_prod3_btn:      { group: 'INSURE', type: 'STRING' },
    insure_prod4_img:      { group: 'INSURE', type: 'IMAGE' },
    insure_prod4_img_alt:  { group: 'INSURE', type: 'STRING' },
    insure_prod4_btn:      { group: 'INSURE', type: 'STRING' },
    insure_wiz_title:      { group: 'INSURE', type: 'STRING' },
    insure_wiz_desc:       { group: 'INSURE', type: 'STRING' },
    insure_wiz_step1:      { group: 'INSURE', type: 'STRING' },
    insure_wiz_step2:      { group: 'INSURE', type: 'STRING' },
    insure_wiz_match:      { group: 'INSURE', type: 'STRING' },
    insure_wiz_btn_view:   { group: 'INSURE', type: 'STRING' },
    insure_wiz_btn_reset:  { group: 'INSURE', type: 'STRING' },
    insure_supp_title:     { group: 'INSURE', type: 'STRING' },
    insure_supp_desc:      { group: 'INSURE', type: 'STRING' },

    // PAYMENTS
    payments_hero_title:       { group: 'PAYMENTS', type: 'STRING' },
    payments_hero_highlight:   { group: 'PAYMENTS', type: 'STRING' },
    payments_hero_desc:        { group: 'PAYMENTS', type: 'STRING' },
    payments_hero_img:         { group: 'PAYMENTS', type: 'IMAGE' },
    payments_hero_alt:         { group: 'PAYMENTS', type: 'STRING' },
    payments_widget_title:     { group: 'PAYMENTS', type: 'STRING' },
    payments_widget_desc:      { group: 'PAYMENTS', type: 'STRING' },
    payments_widget_fee_label: { group: 'PAYMENTS', type: 'STRING' },
    payments_widget_fee_value: { group: 'PAYMENTS', type: 'STRING' },
    payments_methods_title:    { group: 'PAYMENTS', type: 'STRING' },
    payments_methods_desc:     { group: 'PAYMENTS', type: 'STRING' },
    payments_method1_title:    { group: 'PAYMENTS', type: 'STRING' },
    payments_method1_desc:     { group: 'PAYMENTS', type: 'STRING' },
    payments_method2_title:    { group: 'PAYMENTS', type: 'STRING' },
    payments_method2_desc:     { group: 'PAYMENTS', type: 'STRING' },
    payments_method3_title:    { group: 'PAYMENTS', type: 'STRING' },
    payments_method3_desc:     { group: 'PAYMENTS', type: 'STRING' },
    payments_est_btn:          { group: 'PAYMENTS', type: 'STRING' },
    payments_est_time_label:   { group: 'PAYMENTS', type: 'STRING' },
    payments_est_time_val:     { group: 'PAYMENTS', type: 'STRING' },
    payments_est_sec_label:    { group: 'PAYMENTS', type: 'STRING' },
    payments_est_sec_val:      { group: 'PAYMENTS', type: 'STRING' },
    payments_est_input_label:  { group: 'PAYMENTS', type: 'STRING' },
    payments_est_output_label: { group: 'PAYMENTS', type: 'STRING' },
    payments_bills_title:      { group: 'PAYMENTS', type: 'STRING' },
    payments_bills_desc:       { group: 'PAYMENTS', type: 'STRING' },
    payments_bills_btn:        { group: 'PAYMENTS', type: 'STRING' },
    payments_bills_img:        { group: 'PAYMENTS', type: 'IMAGE' },
    payments_bills_alt:        { group: 'PAYMENTS', type: 'STRING' },
    payments_p2p_title:        { group: 'PAYMENTS', type: 'STRING' },
    payments_p2p_desc:         { group: 'PAYMENTS', type: 'STRING' },
    payments_p2p_btn:          { group: 'PAYMENTS', type: 'STRING' },
    payments_p2p_img:          { group: 'PAYMENTS', type: 'IMAGE' },
    payments_p2p_alt:          { group: 'PAYMENTS', type: 'STRING' },
    payments_wires_title:      { group: 'PAYMENTS', type: 'STRING' },
    payments_wires_desc:       { group: 'PAYMENTS', type: 'STRING' },
    payments_wires_btn:        { group: 'PAYMENTS', type: 'STRING' },
    payments_wires_img:        { group: 'PAYMENTS', type: 'IMAGE' },
    payments_wires_alt:        { group: 'PAYMENTS', type: 'STRING' },
    payments_supp_title:       { group: 'PAYMENTS', type: 'STRING' },
    payments_supp_desc:        { group: 'PAYMENTS', type: 'STRING' },
    payments_supp1_title:      { group: 'PAYMENTS', type: 'STRING' },
    payments_supp1_desc:       { group: 'PAYMENTS', type: 'STRING' },
    payments_supp2_title:      { group: 'PAYMENTS', type: 'STRING' },
    payments_supp2_desc:       { group: 'PAYMENTS', type: 'STRING' },
    payments_util1_title:      { group: 'PAYMENTS', type: 'STRING' },
    payments_util1_desc:       { group: 'PAYMENTS', type: 'STRING' },
    payments_util2_title:      { group: 'PAYMENTS', type: 'STRING' },
    payments_util2_desc:       { group: 'PAYMENTS', type: 'STRING' },
    payments_util3_title:      { group: 'PAYMENTS', type: 'STRING' },
    payments_util3_desc:       { group: 'PAYMENTS', type: 'STRING' },

    // LEARN
    learn_hero_title:         { group: 'LEARN', type: 'STRING' },
    learn_hero_highlight:     { group: 'LEARN', type: 'STRING' },
    learn_hero_desc:          { group: 'LEARN', type: 'STRING' },
    learn_hero_img:           { group: 'LEARN', type: 'IMAGE' },
    learn_hero_alt:           { group: 'LEARN', type: 'STRING' },
    learn_pulse_title:        { group: 'LEARN', type: 'STRING' },
    learn_pulse_desc:         { group: 'LEARN', type: 'STRING' },
    learn_insights_title:     { group: 'LEARN', type: 'STRING' },
    learn_insights_desc:      { group: 'LEARN', type: 'STRING' },
    learn_art1_tag:           { group: 'LEARN', type: 'STRING' },
    learn_art1_title:         { group: 'LEARN', type: 'STRING' },
    learn_art1_desc:          { group: 'LEARN', type: 'STRING' },
    learn_art1_img:           { group: 'LEARN', type: 'IMAGE' },
    learn_art1_alt:           { group: 'LEARN', type: 'STRING' },
    learn_art1_link:          { group: 'LEARN', type: 'STRING' },
    learn_art2_tag:           { group: 'LEARN', type: 'STRING' },
    learn_art2_title:         { group: 'LEARN', type: 'STRING' },
    learn_art2_desc:          { group: 'LEARN', type: 'STRING' },
    learn_art2_img:           { group: 'LEARN', type: 'IMAGE' },
    learn_art2_alt:           { group: 'LEARN', type: 'STRING' },
    learn_art2_link:          { group: 'LEARN', type: 'STRING' },
    learn_art3_tag:           { group: 'LEARN', type: 'STRING' },
    learn_art3_title:         { group: 'LEARN', type: 'STRING' },
    learn_art3_desc:          { group: 'LEARN', type: 'STRING' },
    learn_art3_img:           { group: 'LEARN', type: 'IMAGE' },
    learn_art3_alt:           { group: 'LEARN', type: 'STRING' },
    learn_art3_link:          { group: 'LEARN', type: 'STRING' },
    learn_pulse_btn:          { group: 'LEARN', type: 'STRING' },
    learn_pulse_q1:           { group: 'LEARN', type: 'STRING' },
    learn_pulse_q2:           { group: 'LEARN', type: 'STRING' },
    learn_pulse_q3:           { group: 'LEARN', type: 'STRING' },
    learn_pulse_res_high:     { group: 'LEARN', type: 'STRING' },
    learn_pulse_res_mid:      { group: 'LEARN', type: 'STRING' },
    learn_pulse_res_low:      { group: 'LEARN', type: 'STRING' },
    learn_pulse_res_high_msg: { group: 'LEARN', type: 'STRING' },
    learn_pulse_res_mid_msg:  { group: 'LEARN', type: 'STRING' },
    learn_pulse_res_low_msg:  { group: 'LEARN', type: 'STRING' },
    learn_cat1_title:         { group: 'LEARN', type: 'STRING' },
    learn_cat1_desc:          { group: 'LEARN', type: 'STRING' },
    learn_cat2_title:         { group: 'LEARN', type: 'STRING' },
    learn_cat2_desc:          { group: 'LEARN', type: 'STRING' },
    learn_cat3_title:         { group: 'LEARN', type: 'STRING' },
    learn_cat3_desc:          { group: 'LEARN', type: 'STRING' },
    learn_cat4_title:         { group: 'LEARN', type: 'STRING' },
    learn_cat4_desc:          { group: 'LEARN', type: 'STRING' },

    // CRYPTO
    crypto_hero_title:         { group: 'CRYPTO', type: 'STRING' },
    crypto_hero_highlight:     { group: 'CRYPTO', type: 'STRING' },
    crypto_hero_desc:          { group: 'CRYPTO', type: 'STRING' },
    crypto_hero_img:           { group: 'CRYPTO', type: 'IMAGE' },
    crypto_hero_alt:           { group: 'CRYPTO', type: 'STRING' },
    crypto_feat1_title:        { group: 'CRYPTO', type: 'STRING' },
    crypto_feat1_desc:         { group: 'CRYPTO', type: 'STRING' },
    crypto_feat2_title:        { group: 'CRYPTO', type: 'STRING' },
    crypto_feat2_desc:         { group: 'CRYPTO', type: 'STRING' },
    crypto_feat3_title:        { group: 'CRYPTO', type: 'STRING' },
    crypto_feat3_desc:         { group: 'CRYPTO', type: 'STRING' },
    crypto_hero_btn_primary:   { group: 'CRYPTO', type: 'STRING' },
    crypto_hero_btn_secondary: { group: 'CRYPTO', type: 'STRING' },
    crypto_table_title :       { group: 'CRYPTO', type: 'STRING' },
    crypto_sec_title:          { group: 'CRYPTO', type: 'STRING' },
    crypto_sec_desc:           { group: 'CRYPTO', type: 'STRING' },

    // ABOUT
    about_hero_title:     { group: 'ABOUT', type: 'STRING' },
    about_hero_desc:      { group: 'ABOUT', type: 'STRING' },
    about_hero_img:       { group: 'ABOUT', type: 'IMAGE' },
    about_hero_alt:       { group: 'ABOUT', type: 'STRING' },
    about_stat_users:     { group: 'ABOUT', type: 'STRING' },
    about_stat_assets:    { group: 'ABOUT', type: 'STRING' },
    about_stat_countries: { group: 'ABOUT', type: 'STRING' },
    about_stat_support:   { group: 'ABOUT', type: 'STRING' },
    about_mission1_title: { group: 'ABOUT', type: 'STRING' },
    about_mission1_desc:  { group: 'ABOUT', type: 'STRING' },
    about_mission2_title: { group: 'ABOUT', type: 'STRING' },
    about_mission2_desc:  { group: 'ABOUT', type: 'STRING' },
    about_mission3_title: { group: 'ABOUT', type: 'STRING' },
    about_mission3_desc:  { group: 'ABOUT', type: 'STRING' },

    // SUPPORT
    support_hero_title:    { group: 'SUPPORT', type: 'STRING' },
    support_hero_desc:     { group: 'SUPPORT', type: 'STRING' },
    support_hero_img:      { group: 'SUPPORT', type: 'IMAGE' },
    support_hero_alt:      { group: 'SUPPORT', type: 'STRING' },
    support_phone_title:   { group: 'SUPPORT', type: 'STRING' },
    support_phone:         { group: 'SUPPORT', type: 'STRING' },
    support_email_title:   { group: 'SUPPORT', type: 'STRING' },
    support_email:         { group: 'SUPPORT', type: 'STRING' },
    support_hours:         { group: 'SUPPORT', type: 'STRING' },
    support_address_title: { group: 'SUPPORT', type: 'STRING' },
    support_address:       { group: 'SUPPORT', type: 'STRING' },
    support_email_desc:    { group: 'SUPPORT', type: 'STRING' },
    support_address_label: { group: 'SUPPORT', type: 'STRING' },
    support_faq_title:     { group: 'SUPPORT', type: 'STRING' },
    support_faq_desc:      { group: 'SUPPORT', type: 'STRING' },
    support_faq_link:      { group: 'SUPPORT', type: 'STRING' },
    support_faq_linkText:  { group: 'SUPPORT', type: 'STRING' },

    // --- RATES PAGE  ---
    rates_hero_title:       { group: 'RATES', type: 'STRING' },
    rates_hero_highlight:   { group: 'RATES', type: 'STRING' },
    rates_hero_desc:        { group: 'RATES', type: 'STRING' },
    rates_hero_img:         { group: 'RATES', type: 'IMAGE' },
    rates_hero_alt:         { group: 'RATES', type: 'STRING' },
    rate_mortgage_30yr:     { group: 'RATES', type: 'STRING' },
    rates_title_deposit:    { group: 'RATES', type: 'STRING' },
    rates_title_borrow:     { group: 'RATES', type: 'STRING' },
    rates_disclaimer_title: { group: 'RATES', type: 'STRING' },
    rates_dep_head_prod:    { group: 'RATES', type: 'STRING' },
    rates_dep_head_rate:    { group: 'RATES', type: 'STRING' },
    rates_dep_head_apy:     { group: 'RATES', type: 'STRING' },
    rates_dep_head_min:     { group: 'RATES', type: 'STRING' },
    rates_loan_head_type:   { group: 'RATES', type: 'STRING' },
    rates_loan_head_term:   { group: 'RATES', type: 'STRING' },
    rates_loan_head_apr:    { group: 'RATES', type: 'STRING' },
    rates_loan_head_detail: { group: 'RATES', type: 'STRING' },
    rates_tag_popular:      { group: 'RATES', type: 'STRING' },
    rates_btn_view:         { group: 'RATES', type: 'STRING' },
    rates_disclaimer:       { group: 'RATES', type: 'STRING' },
    rate_hysa_name:         { group: 'RATES', type: 'STRING' },
    rate_hysa_rate:         { group: 'RATES', type: 'STRING' },
    rate_hysa_min:          { group: 'RATES', type: 'STRING' },
    rate_mma_name:          { group: 'RATES', type: 'STRING' },
    rate_mma_rate:          { group: 'RATES', type: 'STRING' },
    rate_mma_min:           { group: 'RATES', type: 'STRING' },
    rate_cd_name:           { group: 'RATES', type: 'STRING' },
    rate_cd_rate:           { group: 'RATES', type: 'STRING' },
    rate_cd_min:            { group: 'RATES', type: 'STRING' },
    rate_kids_name:         { group: 'RATES', type: 'STRING' },
    rate_kids_rate:         { group: 'RATES', type: 'STRING' },
    rate_kids_min:          { group: 'RATES', type: 'STRING' },
    rate_auto_name:         { group: 'RATES', type: 'STRING' },
    rate_auto_term:         { group: 'RATES', type: 'STRING' },
    rate_personal_name:     { group: 'RATES', type: 'STRING' },
    rate_personal_term:     { group: 'RATES', type: 'STRING' },
    rate_mortgage_name:     { group: 'RATES', type: 'STRING' },
    rate_mortgage_term:     { group: 'RATES', type: 'STRING' },
    rate_cc_name:           { group: 'RATES', type: 'STRING' },
    rate_cc_term:           { group: 'RATES', type: 'STRING' },
    rate_cc_intro:          { group: 'RATES', type: 'STRING' },

    // --- DASHBOARD SETTINGS ---
    dashboard_alert_show:    { group: 'DASHBOARD', type: 'BOOLEAN' },
    dashboard_alert_type:    { group: 'DASHBOARD', type: 'STRING' },
    dashboard_alert_msg:     { group: 'DASHBOARD', type: 'STRING' },
    dashboard_promo_title:   { group: 'DASHBOARD', type: 'STRING' },
    dashboard_promo_desc:    { group: 'DASHBOARD', type: 'STRING' },
    dashboard_promo_btn:     { group: 'DASHBOARD', type: 'STRING' },
    dashboard_promo_link:    { group: 'DASHBOARD', type: 'STRING' },
    dashboard_support_phone: { group: 'DASHBOARD', type: 'STRING' },
    dashboard_support_email: { group: 'DASHBOARD', type: 'STRING' },

  // --- SECURITY PAGE ---
    security_hero_title:       { group: 'SECURITY', type: 'STRING' },
    security_hero_desc:        { group: 'SECURITY', type: 'STRING' },
    security_hero_img:         { group: 'SECURITY', type: 'IMAGE' },
    security_hero_alt:         { group: 'SECURITY', type: 'STRING' },
    security_feat1_title:      { group: 'SECURITY', type: 'STRING' },
    security_feat1_desc:       { group: 'SECURITY', type: 'STRING' },
    security_feat2_title:      { group: 'SECURITY', type: 'STRING' },
    security_feat2_desc:       { group: 'SECURITY', type: 'STRING' },
    security_feat3_title:      { group: 'SECURITY', type: 'STRING' },
    security_feat3_desc:       { group: 'SECURITY', type: 'STRING' },
    security_fraud_title:      { group: 'SECURITY', type: 'STRING' },
    security_fraud_card_title: { group: 'SECURITY', type: 'STRING' },
    security_fraud_card_desc:  { group: 'SECURITY', type: 'STRING' },

    // ---  HELP PAGE ---
    help_hero_title:    { group: 'HELP', type: 'STRING' },
    help_hero_desc:     { group: 'HELP', type: 'STRING' },
    help_cta_title:     { group: 'HELP', type: 'STRING' },
    help_cta_desc:      { group: 'HELP', type: 'STRING' },
    help_action1_title: { group: 'HELP', type: 'STRING' },
    help_action1_desc:  { group: 'HELP', type: 'STRING' },
    help_action2_title: { group: 'HELP', type: 'STRING' },
    help_action2_desc:  { group: 'HELP', type: 'STRING' },
    help_action3_title: { group: 'HELP', type: 'STRING' },
    help_action3_desc:  { group: 'HELP', type: 'STRING' },
    help_action4_title: { group: 'HELP', type: 'STRING' },
    help_action4_desc:  { group: 'HELP', type: 'STRING' },

    // --- CAREERS PAGE ---
    careers_hero_title:      { group: 'CAREERS', type: 'STRING' },
    careers_hero_desc:       { group: 'CAREERS', type: 'STRING' },
    careers_hero_img:        { group: 'CAREERS', type: 'IMAGE' },
    careers_hero_img_alt:    { group: 'CAREERS', type: 'STRING' },
    careers_val1_title:      { group: 'CAREERS', type: 'STRING' },
    careers_val1_desc:       { group: 'CAREERS', type: 'STRING' },
    careers_val2_title:      { group: 'CAREERS', type: 'STRING' },
    careers_val2_desc:       { group: 'CAREERS', type: 'STRING' },
    careers_val3_title:      { group: 'CAREERS', type: 'STRING' },
    careers_val3_desc:       { group: 'CAREERS', type: 'STRING' },
    careers_hero_btn_text:   { group: 'CAREERS', type: 'STRING' },
    careers_hero_btn_link:   { group: 'CAREERS', type: 'STRING' },
    careers_values_subtitle: { group: 'CAREERS', type: 'STRING' },
    careers_jobs_title:      { group: 'CAREERS', type: 'STRING' },
    careers_jobs_no_roles:   { group: 'CAREERS', type: 'STRING' },
    careers_jobs_email_text: { group: 'CAREERS', type: 'STRING' },

    // --- LOCATIONS PAGE ---
    locations_hero_title:          { group: 'LOCATIONS', type: 'STRING' },
    locations_search_placeholder:  { group: 'LOCATIONS', type: 'STRING' },
    locations_search_btn_text:     { group: 'LOCATIONS', type: 'STRING' },
    locations_results_label:       { group: 'LOCATIONS', type: 'STRING' },
    locations_no_results_text:     { group: 'LOCATIONS', type: 'STRING' },
    locations_clear_btn_text:      { group: 'LOCATIONS', type: 'STRING' },
    locations_open_label:          { group: 'LOCATIONS', type: 'STRING' },
    locations_tag_atm:             { group: 'LOCATIONS', type: 'STRING' },
    locations_tag_drive_thru:      { group: 'LOCATIONS', type: 'STRING' },
    locations_tag_notary:          { group: 'LOCATIONS', type: 'STRING' },
    locations_directions_btn_text: { group: 'LOCATIONS', type: 'STRING' },

    // --- PRESS PAGE ---
    press_hero_title:        { group: 'PRESS', type: 'STRING' },
    press_hero_desc:         { group: 'PRESS', type: 'STRING' },
    press_hero_img:          { group: 'PRESS', type: 'IMAGE' },
    press_hero_img_alt:      { group: 'PRESS', type: 'STRING' },
    press_kit_title:         { group: 'PRESS', type: 'STRING' },
    press_kit_desc:          { group: 'PRESS', type: 'STRING' },
    press_kit_link:          { group: 'PRESS', type: 'STRING' },
    press_contact_email:     { group: 'PRESS', type: 'STRING' },
    press_release_title:     { group: 'PRESS', type: 'STRING' },
    press_empty_state:       { group: 'PRESS', type: 'STRING' },
    press_read_more_text:    { group: 'PRESS', type: 'STRING' },
    press_download_btn_text: { group: 'PRESS', type: 'STRING' },
    press_file_icon:         { group: 'PRESS', type: 'IMAGE' },
    press_file_name:         { group: 'PRESS', type: 'STRING' },
    press_file_size:         { group: 'PRESS', type: 'STRING' },
    press_about_title:       { group: 'PRESS', type: 'STRING' },
    press_about_desc:        { group: 'PRESS', type: 'STRING' },

    // --- INVESTORS PAGE ---
    invest_hero_title:        { group: 'INVESTORS', type: 'STRING' },
    invest_hero_desc:         { group: 'INVESTORS', type: 'STRING' },
    invest_hero_img:          { group: 'INVESTORS', type: 'IMAGE' },
    invest_hero_img_alt:      { group: 'INVESTORS', type: 'STRING' },
    invest_download_pdf_text: { group: 'INVESTORS', type: 'STRING' },
    invest_view_link_text:    { group: 'INVESTORS', type: 'STRING' },
    invest_stock_price:       { group: 'INVESTORS', type: 'STRING' },
    invest_stock_change:      { group: 'INVESTORS', type: 'STRING' },
    invest_ticker_symbol:     { group: 'INVESTORS', type: 'STRING' },
    invest_market_cap:        { group: 'INVESTORS', type: 'STRING' },
    invest_reports_title:     { group: 'INVESTORS', type: 'STRING' },

    // --- LEGAL PAGE ---
    legal_privacy_policy:          { group: 'LEGAL', type: 'RICH_TEXT' },
    legal_terms_service:           { group: 'LEGAL', type: 'RICH_TEXT' },
    legal_accessibility_statement: { group: 'LEGAL', type: 'RICH_TEXT' },
    legal_back_text:               { group: 'LEGAL', type: 'STRING' },
    legal_footer_text :            { group: 'LEGAL', type: 'STRING' },
    legal_link_text:               { group: 'LEGAL', type: 'STRING' },
    legal_link_url :               { group: 'LEGAL', type: 'STRING' },
    legal_updated_label:           { group: 'LEGAL', type: 'STRING' },

    // --- FOOTER PAGE ---
    footer_mission_title:    { group: 'FOOTER', type: 'STRING' },
    footer_mission_text:     { group: 'FOOTER', type: 'STRING' },
    footer_lbl_support:      { group: 'FOOTER', type: 'STRING' },
    footer_lbl_hours:        { group: 'FOOTER', type: 'STRING' },
    footer_val_hours:        { group: 'FOOTER', type: 'STRING' },
    footer_lbl_email:        { group: 'FOOTER', type: 'STRING' },
    footer_lbl_video:       { group: 'FOOTER', type: 'STRING' },
    footer_val_video:        { group: 'FOOTER', type: 'STRING' },
    footer_col1_title:       { group: 'FOOTER', type: 'STRING' },
    footer_col2_title:       { group: 'FOOTER', type: 'STRING' },
    footer_badge1:           { group: 'FOOTER', type: 'STRING' },
    footer_badge2:           { group: 'FOOTER', type: 'STRING' },
    footer_badge3:           { group: 'FOOTER', type: 'STRING' },
    footer_lbl_headquarters: { group: 'FOOTER', type: 'STRING' },
    footer_lbl_locate:       { group: 'FOOTER', type: 'STRING' },
    footer_lbl_copyright:    { group: 'FOOTER', type: 'STRING' },
    social_facebook:         { group: 'SOCIAL', type: 'STRING' },
    social_twitter:          { group: 'SOCIAL', type: 'STRING' },
    social_linkedin:         { group: 'SOCIAL', type: 'STRING' },
    social_instagram:        { group: 'SOCIAL', type: 'STRING' },
};


export async function updateSiteSettings(formData: FormData) {
    // 1. Security & Auth Check
    const { authorized, session } = await checkAdminAction();

    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }

    const existing = await db.siteSettings.findFirst();

    if (!existing) {
        return { success: false, message: "Settings initialization error. Run seed." };
    }

    const mainUpdates: any = {};
    const contentUpdates: any = {};
    const featureUpdates: any = {};

    // 1. Define Prefixes for Content Table
    const contentPrefixes = [
        'hero_', 'global_stat_', 'home_', 'guide_', 'partner_',
        'learn_', 'about_', 'locations_', 'rates_', 'security_',
        'legal_', 'help_', 'careers_', 'press_', 'investors_',
        'dashboard_', 'footer_', 'social_'
    ];

    // 2. Define Prefixes for Features Table
    const featurePrefixes = [
        'bank_', 'save_', 'borrow_', 'wealth_', 'crypto_', 'insure_', 'payments_'
    ];

    for (const [key, meta] of Object.entries(SETTING_METADATA)) {
        const rawValue = formData.get(key);
        let finalValue: string | null = null;

        // Handle Boolean Logic
        if (meta.type === 'BOOLEAN') {
            const isChecked = rawValue === 'on' || rawValue === 'true' || rawValue === '1';
            finalValue = isChecked ? "true" : "false";
        } else {
            // Handle Strings/Text
            if (rawValue !== null) {
                finalValue = rawValue as string;
            }
        }

        // Sort into the correct bucket if value exists
        if (finalValue !== null) {
            if (key === 'security_login_limit') {
                mainUpdates[key] = parseInt(finalValue, 10);
                continue;
            }
            const isFeatureField = featurePrefixes.some(prefix => key.startsWith(prefix));
            const isContentField = contentPrefixes.some(prefix => key.startsWith(prefix));

            if (isFeatureField) {
                featureUpdates[key] = finalValue;
            } else if (isContentField) {
                contentUpdates[key] = finalValue;
            } else {
                mainUpdates[key] = finalValue;
            }
        }
    }

    const rawLoginLimit = formData.get('security_login_limit');
    if (rawLoginLimit) {
        mainUpdates['security_login_limit'] = parseInt(rawLoginLimit.toString(), 10);
    }

    try {
        // 1. Update Main Settings Table
        if (Object.keys(mainUpdates).length > 0) {
            await db.siteSettings.update({
                where: { id: existing.id },
                data: mainUpdates,
            });
        }

        // 2. Upsert Content Settings
        if (Object.keys(contentUpdates).length > 0) {
            await db.contentSettings.upsert({
                where: { siteSettingsId: existing.id },
                update: contentUpdates,
                create: {
                    siteSettingsId: existing.id,
                    ...contentUpdates
                }
            });
        }

        // 3. Upsert Content Features
        if (Object.keys(featureUpdates).length > 0) {
            await db.contentFeatures.upsert({
                where: { siteSettingsId: existing.id },
                update: featureUpdates,
                create: {
                    siteSettingsId: existing.id,
                    ...featureUpdates
                }
            });
        }

        // 4. LOG THE ACTION
        await logAdminAction(
            "SYSTEM_SETTINGS_UPDATE",
            existing.id,
            {
                action: "CMS Content Update",
                updatedFields: Object.keys({ ...mainUpdates, ...contentUpdates, ...featureUpdates }).length,
                admin: session.user.email
            },
            "INFO",
            "SUCCESS"
        );

        revalidatePath('/', 'layout');

        return { success: true, message: "Settings updated successfully" };
    } catch (error) {
        console.error("Settings Update Error:", error);
        return { success: false, message: "Failed to save settings" };
    }
}

// export async function updateSiteSettings(formData: FormData) {
//     const existing = await db.siteSettings.findFirst();

//     if (!existing) {
//         return { success: false, message: "Settings initialization error. Run seed." };
//     }

//     const mainUpdates: any = {};
//     const contentUpdates: any = {};
//     const featureUpdates: any = {};

//     // 1. Define Prefixes for Content Table (General Pages)
//     const contentPrefixes = [
//         'hero_', 'global_stat_', 'home_', 'guide_', 'partner_',
//         'learn_', 'about_', 'locations_', 'rates_', 'security_',
//         'legal_', 'help_', 'careers_', 'press_', 'investors_',
//         'dashboard_', 'footer_', 'social_'
//     ];

//     // 2. Define Prefixes for Features Table (The Heavy Product Pages)
//     const featurePrefixes = [
//         'bank_', 'save_', 'borrow_', 'wealth_', 'crypto_', 'insure_', 'payments_'
//     ];

//     // Loop through metadata to extract values
//     for (const [key, meta] of Object.entries(SETTING_METADATA)) {
//         const rawValue = formData.get(key);
//         let finalValue: string | null = null;

//         // Handle Boolean Logic
//         if (meta.type === 'BOOLEAN') {
//             const isChecked = rawValue === 'on' || rawValue === 'true' || rawValue === '1';
//             finalValue = isChecked ? "true" : "false";
//         } else {
//             // Handle Strings/Text
//             if (rawValue !== null) {
//                 finalValue = rawValue as string;
//             }
//         }

//         // Sort into the correct bucket if value exists
//         if (finalValue !== null) {
//             const isFeatureField = featurePrefixes.some(prefix => key.startsWith(prefix));
//             const isContentField = contentPrefixes.some(prefix => key.startsWith(prefix));

//             if (isFeatureField) {
//                 featureUpdates[key] = finalValue;
//             } else if (isContentField) {
//                 contentUpdates[key] = finalValue;
//             } else {
//                 mainUpdates[key] = finalValue;
//             }
//         }
//     }

//     try {
//         // 1. Update Main Settings Table
//         if (Object.keys(mainUpdates).length > 0) {
//             await db.siteSettings.update({
//                 where: { id: existing.id },
//                 data: mainUpdates,
//             });
//         }

//         // 2. Upsert Content Settings
//         if (Object.keys(contentUpdates).length > 0) {
//             await db.contentSettings.upsert({
//                 where: { siteSettingsId: existing.id },
//                 update: contentUpdates,
//                 create: {
//                     siteSettingsId: existing.id,
//                     ...contentUpdates
//                 }
//             });
//         }

//         // 3. Upsert Content Features
//         if (Object.keys(featureUpdates).length > 0) {
//             await db.contentFeatures.upsert({
//                 where: { siteSettingsId: existing.id },
//                 update: featureUpdates,
//                 create: {
//                     siteSettingsId: existing.id,
//                     ...featureUpdates
//                 }
//             });
//         }

//         revalidatePath('/', 'layout');

//         return { success: true, message: "Settings updated successfully" };
//     } catch (error) {
//         console.error("Settings Update Error:", error);
//         return { success: false, message: "Failed to save settings" };
//     }
// }