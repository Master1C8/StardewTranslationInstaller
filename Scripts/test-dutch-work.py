#!/usr/bin/env python3
"""Focused integrity tests; never touches installed game or translation records."""
import importlib.util
from pathlib import Path
import unittest

spec=importlib.util.spec_from_file_location('dutch_work',Path(__file__).with_name('dutch-work.py'))
work=importlib.util.module_from_spec(spec); spec.loader.exec_module(work)

class IntegrityTests(unittest.TestCase):
    def check(self,source,translation,target='Strings/UI',note=''):
        return work.validate_record(target,'test',source,translation,note)

    def test_dialogue_keeps_emotion_and_player_name(self):
        self.assertEqual(self.check('Hello, @!$h#$e#Good day.','Hallo, @!$h#$e#Goedendag.'),[])
        self.assertTrue(self.check('Hello, @!$h','Hallo!'))

    def test_formatting_arguments_cannot_disappear(self):
        self.assertTrue(self.check('Price: {0}g','Prijs: g'))
        self.assertEqual(self.check('Price: {0}g','Prijs: {0}g'),[])

    def test_unchanged_values_need_review_reason(self):
        self.assertTrue(self.check('Winter','Winter'))
        self.assertEqual(self.check('Winter','Winter',note='Same spelling in Dutch.'),[])

    def test_event_dialogue_changes_but_commands_do_not(self):
        source='pause 500/speak Sam "Hello, @!$h"/end'
        self.assertEqual(self.check(source,'pause 500/speak Sam "Hallo, @!$h"/end','Data/Events/Town'),[])
        self.assertTrue(self.check(source,'pause 100/speak Sam "Hallo, @!$h"/end','Data/Events/Town'))
        self.assertTrue(self.check(source,'pause 500/speak Pam "Hallo, @!$h"/end','Data/Events/Town'))

    def test_reviewed_quoted_replacements_preserve_event_commands(self):
        source='pause 500/speak Sam "Hello, @!$h"/message "Time to go."/end'
        translated=work.replace_quoted_text(source,{'Hello, @!$h':'Hallo, @!$h','Time to go.':'Tijd om te gaan.'})
        self.assertEqual(translated,'pause 500/speak Sam "Hallo, @!$h"/message "Tijd om te gaan."/end')
        self.assertEqual(self.check(source,translated,'Data/Events/Town'),[])
        with self.assertRaises(ValueError):
            work.replace_quoted_text(source,{'Missing':'Ontbreekt'})

    def test_repeated_quoted_text_is_replaced_everywhere(self):
        source='message "Again"/pause 100/message "Again"/end'
        translated=work.replace_quoted_text(source,{'Again':'Nogmaals'})
        self.assertEqual(translated,'message "Nogmaals"/pause 100/message "Nogmaals"/end')
        self.assertEqual(self.check(source,translated,'Data/Events/Town'),[])

    def test_event_fragment_masks_leading_dialogue_only(self):
        source='I found my way."/pause 500/speak Alex "Thank you, @."'
        translated='Ik heb mijn weg gevonden."/pause 500/speak Alex "Bedankt, @."'
        self.assertEqual(self.check(source,translated,'Data/ExtraDialogue'),[])
        changed_command=translated.replace('/pause 500/','/pause 100/')
        self.assertTrue(self.check(source,changed_command,'Data/ExtraDialogue'))

    def test_event_quick_question_choices_can_be_translated(self):
        source='pause 500/quickQuestion #Do this.#Do that.(break)speak Birdie "Good."(break)end'
        translated='pause 500/quickQuestion #Doe dit.#Doe dat.(break)speak Birdie "Goed."(break)end'
        self.assertEqual(self.check(source,translated,'Strings/Locations'),[])
        self.assertTrue(self.check(source,translated.replace('pause 500/','pause 100/'),'Strings/Locations'))

    def test_reviewed_quick_question_replacements_preserve_event_commands(self):
        source='pause 500/quickQuestion #Do this.#Do that.(break)speak Birdie "Good."(break)end'
        translated=work.replace_quick_questions(source,{'#Do this.#Do that.':'#Doe dit.#Doe dat.'})
        self.assertEqual(translated,'pause 500/quickQuestion #Doe dit.#Doe dat.(break)speak Birdie "Good."(break)end')
        self.assertEqual(self.check(source,translated,'Data/Events/Town'),[])
        with self.assertRaises(ValueError):
            work.replace_quick_questions(source,{'#Missing':'#Ontbreekt'})

    def test_structured_numeric_fields_remain_exact(self):
        source='Sneakers/A description/50/1/0/0/Sneakers'
        self.assertEqual(self.check(source,'Sneakers/Een beschrijving/50/1/0/0/Sneakers','Data/Boots'),[])
        self.assertTrue(self.check(source,'Sneakers/Een beschrijving/50/9/0/0/Sneakers','Data/Boots'))
        self.assertTrue(self.check(source,'Sneakers/Een beschrijving/50/1/0/Sneakers','Data/Boots'))

    def test_engine_enums_cannot_be_translated(self):
        self.assertTrue(self.check('0/float','0/drijven','Data/AquariumFish'))
        self.assertTrue(self.check('1/2/right/bench/0/0/true','1/2/rechts/bank/0/0/true','Data/ChairTiles'))
        self.assertTrue(self.check('hairstyles2/0/0/true/-1/false','kapsels2/0/0/true/-1/false','Data/HairData'))
        self.assertTrue(self.check('-5 1/10 10/194/default/','-5 1/10 10/194/standaard/','Data/CookingRecipes'))
        self.assertTrue(self.check('388 2/Field/322/false/default/','388 2/Veld/322/false/default/','Data/CraftingRecipes'))
        furniture='Oak Chair/chair/-1/-1/4/350/-1/[LocalizedText Strings\\Furniture:OakChair]'
        self.assertTrue(self.check(furniture,furniture.replace('chair','stoel',1),'Data/Furniture'))
        self.assertEqual(self.check('0/float','0/float','Data/AquariumFish','Engine movement enum.'),[])

    def test_animation_references_and_flags_remain_exact(self):
        self.assertTrue(self.check('0/16 17/0/silent','0/16 17/0/stil','Data/animationDescriptions'))
        source='22/20/22/Strings\\animationDescriptions:abigail_videogames'
        self.assertTrue(self.check(source,source.replace('abigail_videogames','abigail_games'),'Data/animationDescriptions'))
        self.assertTrue(self.check('16/18/16//laying_down','16/18/16//liggen','Data/animationDescriptions'))
        self.assertEqual(self.check(source,source,'Data/animationDescriptions','Reference to separately localized Strings asset.'),[])

    def test_markup_and_newlines_are_preserved(self):
        self.assertTrue(self.check('Hello\n[image] world','Hallo wereld'))
        self.assertTrue(self.check('Item (O)24','Voorwerp (O)25'))
        self.assertTrue(self.check('{{Token}} arrives','Komt aan'))

if __name__=='__main__': unittest.main()
